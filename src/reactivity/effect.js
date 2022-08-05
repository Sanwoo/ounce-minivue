import { extend } from "../shared";

let activeEffect
// 维护一个全局变量activeEffect，并在class ReactiveEffect的run中将activeEffect指向this，这样当一个effect函数run时就可以通过activeEffect这个全局变量取到它
let shouldTrack
// 维护一个全局变量shouldTrack，在stop后在track中控制是否进行依赖收集

export class ReactiveEffect {
    constructor(fn, scheduler = null) {
        // 传入scheduler，scheduler并不是必须的，所以初始化为null
        this.fn = fn
        // 将fn作为方法绑定在effect实例身上
        this.scheduler = scheduler
        // 将scheduler作为方法绑定在effect实例身上
        this.deps = []
        // 初始化一个deps数组属性，方便track中实现effect实例反向收集deps
        this.active = true
        // 用来控制是否需要清除effect实例
    }
    run() {
        if (!this.active) {
            // 判断此时是否在stop状态，是stop状态则直接return this.fn()
            return this.fn()
        }
        shouldTrack = true
        // 当不是在stop状态时，将shouldTrack赋值为true则可以进行track收集依赖
        activeEffect = this
        // 将activeEffect指向this，这样当一个effect函数run时就可以通过activeEffect这个全局变量取到它来实现依赖收集
        const result = this.fn()
        // 在这里为了实现返回fn用户行为函数的返回值将返回值用result接住并return
        shouldTrack = false
        // run执行完毕后将shouldTrack = false使得不能进行依赖收集
        return result
    }
    stop() {
        // 添加stop方法，删除effect实例  
        if (this.active) {
            // 性能优化，防止多次连续stop浪费性能(连续多次stop效果等同于一次stop)
            cleanupEffect(this)
            if (this.onStop) {
                this.onStop()
            }
            // 清除deps后完成stop功能，此时判断是否有onStop，有就调用onStop()
            this.active = false
        }
    }
}

function cleanupEffect(effect) {
    // 清除函数，将deps中的effect实例全部删除
    const { deps } = effect;
    if (deps.length) {
        for (let i = 0; i < deps.length; i++) {
            deps[i].delete(effect);
        }
        deps.length = 0;
    }
}

export function effect(fn, options) {
    //fn就是用户行为函数
    //const scheduler = options.scheduler
    const _effect = new ReactiveEffect(fn)
    //此时使用了object.assign将options放在effect实例里面，scheduler也是options内的一个属性，那么就不需要将scheduler作为形参传入ReactiveEffect
    if (options) {
        // object.assign将options挂载在effect实例上
        extend(_effect, options);
    }
    //如果有options，就将其挂载到effect实例下，options中目前可能包括scheduler和onStop
    _effect.run()
    const runner = _effect.run.bind(_effect)
    runner.effect = _effect
    // 将effect实例反向挂载在runner身上，因为stop方法中只传入一个runner，所以通过反向挂载方式获取effect实例
    return runner
    // bind将run()内的this指针指向_effect，而不是activeEffect（在上面的class ReactiveEffect的run()中将this指向了activeEffect，这里为了返回正常runner，用bind修改this指向），然后将_effect.run()返回给runner并将runner return
}

export function stop(runner) {
    runner.effect.stop()
    // 调用effect实例身上的stop方法
}

const targetMap = new WeakMap()
export function track(target, key) {
    if (!isTracking) {
        // 通过isTracking判断是否要进行track
        return
    }
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()));
    }
    let dep = depsMap.get(key);
    if (!dep) {
        depsMap.set(key, (dep = new Set()));
    }
    trackEffects(dep)
}

export function trackEffects(dep) {
    // 将依赖收集的过程抽离成新的函数
    if (dep.has(activeEffect)) {
        // 性能优化，判断是否已经收集了当前的activeEffect也就是当前的effect实例，如果已经收集了则return
        return
    }
    dep.add(activeEffect)
    //通过activeEffect全局变量取到effect实例，并将其存储在dep中
    activeEffect.deps.push(dep)
    //effect实例反向收集当前的deps集合，方便stop功能删除所有effect实例
}

export function isTracking() {
    // 通过shouldTrack和activeEffect !== undefined来判断是否要进行track
    // 同时防止了stop后进行依赖收集和没有effect函数直接get时activeEffect为空时进行依赖收集
    return shouldTrack && activeEffect !== undefined
}

export function trigger(target, key) {
    let depsMap = targetMap.get(target)
    let dep = depsMap.get(key)
    triggerEffects(dep)
}

export function triggerEffects(dep) {
    // 将触发依赖的过程抽离成新的函数
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler()
        } else {
            effect.run()
        }
        //触发依赖时如果有scheduler就执行scheduler，没有就执行run
    }
}