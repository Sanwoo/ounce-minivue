import { hasChanged, isObject } from "../shared";
import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";

class RefImpl {
  constructor(value) {
      this._rawValue = value
      // 维护rawValue避免当value为对象时将其reactive()后变成proxy无法进行hasChanged判断
      this._value = convert(value)
      // 当value是对象时将其reactive()
      this.dep = new Set()
      // 初始化dep用于依赖收集
      this.__v_isRef = true
      // 初始化__v_isRef标识为true，用来实现isRef和unRef
  }

  get value() {
      trackRefValue(this)
      // ref的依赖收集
      return this._value
      // refObject.value实现get
  }

  set value(newValue) {
      if (hasChanged(newValue, this._rawValue)) {
          // 判断set的是否是和原value不同的新value，是则进行数据更新和依赖收集
          this._rawValue = newValue
          this._value = convert(newValue)
          // 当newValue是对象时将其reactive()
          triggerEffects(this.dep)
      }
  }
}

function convert(value) {
  // 将判断value是否为object，是则将其reactive()，不是则原值返回的逻辑抽离成新函数
  return isObject(value) ? reactive(value) : value
}

function trackRefValue(ref) {
  if (isTracking()) {
      // 此处主要用于判断activeEffect是否为空
      trackEffects(ref.dep)
      // trackEffects函数实现依赖收集
  }
}

export function ref(value) {
  return new RefImpl(value)
}

export function isRef(ref) {
  // 判断是否为ref，是则返回true，否则返回false
  return !!ref.__v_isRef
}

export function unRef(ref) {
  // ref则返回ref.value，非ref则原样返回
  return isRef(ref) ? ref.value : ref
}

export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
      // 使用proxy进行数据劫持加工
      get(target, key, receiver) {
          return unRef(Reflect.get(target, key, receiver))
          // unref判断get的数据是否为ref，是则返回ref.value，否则返回value，这样在template中不用写.value
      },
      set(target, key, value, receiver) {
          const oldValue = target[key]
          if (isRef(oldValue) && !isRef(value)) {
              // set的新数据不是ref而原数据是ref时，直接将新值赋给旧值的.value
              oldValue.value = value
              return true
          } else {
              // 其他情况就直接替换
              return Reflect.set(target, key, value, receiver)
          }
      }
  })
}