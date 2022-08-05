import { ReactiveEffect } from "./effect"

class ComputedRefImpl {
    constructor(getter){
        this._getter = getter
        this._dirty = true
        // 用于标识配合_value实现缓存，第一次getter后缓存给_value
        this._value
        // 缓存第一次getter的值
        this._effect = new ReactiveEffect(getter, () => {
            if(!this._dirty){
                this._dirty = true
            }
            // 用scheduler实现fn内参数值发生变化但getter不重复调用并且实现数据更新和缓存
        })
    }

    get value(){
        if(this._dirty){
            this._dirty = false
            this._value = this._effect.run()
            // 将getter传给effect实例，用effect实例身上的run()实现getter
        }

        return this._value
    }
}

export function computed(getter) {
    return ComputedRefImpl(getter)
}