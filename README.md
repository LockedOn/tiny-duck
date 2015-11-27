<img alt="TinyDuck" src="https://github.com/LockedOn/tiny-duck/blob/master/TinyDuck_Logo.png" style="width:100px; float:right">

# Tiny Duck

Composable redux reducers

[![Build Status](https://travis-ci.org/LockedOn/tiny-duck.svg?branch=master)](https://travis-ci.org/LockedOn/tiny-duck)

Tiny Duck is a small library that allows you to define small, reusable collections of reducer actions and compose them together. 

Tiny Duck gives you high code reuse and testabilty for your redux reducers.

Tiny Duck was inspired from the pattern of [erikras/ducks-modular-redux](https://github.com/erikras/ducks-modular-redux) where you bundler all of your actions, action types and reducers in the one module.

### Getting Started

Tiny Duck is available on npm: `npm install tiny-duck`

In the follow examples we are going to use Tiny Duck to create an counter workflow and reuse it in multiple sub states.

Let's first start by importing TinyDuck and creating our counter workflow.

```javascript
import TinyDuck from 'tiny-duck';

// Create counter workflow
const counter = {
  initialState: {
    counter: 0
  },
  UP: (state, action) => ({
    ...state,
    counter: (state.counter + 1)
  }),
  DOWN: (state, action) => ({
    ...state,
    counter: (state.counter - 1)
  })
};
```

The counter workflow is a plain javascript object with 3 parts.

* `initialState` is a reserved word in TinyDuck allowing you to set the initial state.
* `UP` and `DOWN` are both pure functions returning a new state, this is how you can defined your reducer actions.

Defining your actions and workflows separately, you are able to test the functions independently from your reducers.

Now that we have our workflow, we can use Tiny Duck to create our reducer and action types.

```javascript
const {reducer, actions} = TinyDuck(counter);

// actions => {UP: 'UP', DOWN: 'DOWN'}
```

`TinyDuck` returns `reducer` and `actions`

* `reducer` is the function you give to redux.
* `actions` is an object containing all the action types defined, including all nested action types. 

`TinyDuck` is a many arity function allowing you to pass many workflows and merge them together.

```javascript
const {reducer, actions} = TinyDuck(counter, {
    RESET: (state, action) => ({counter:0})
});

// actions => {UP: 'UP', DOWN: 'DOWN', RESET: 'RESET'}
```

### Namespaces

Optionally `TinyDuck` can take a string as the first argument. This string will then be used to namespace all `relative actions`. The default namespace is empty `''`.

**Namespaces** with Tiny Duck work similar to URL's where you can have relative and absolute URL's you can also have relative and absolute namespaces. Absolute namespaces are created by prefixing your namespace with `/`.

Example:

```javascript
const {reducer, actions} = TinyDuck('ns', counter);

// actions => {UP: 'ns/UP', DOWN: 'ns/DOWN'}
```

### Tiny Duck Composition

Tiny Duck allows you to compose other `TinyDuck` as reducers to operate on sub portions of state.

```javascript
const {reducer, actions, initialState} = TinyDuck({
   counter1: TinyDuck(counter),
   counter2: TinyDuck(counter)
});

/*
actions => {
    counter1: {UP: 'counter1/UP', DOWN: 'counter1/DOWN'}, 
    counter2: {UP: 'counter2/UP', DOWN: 'counter2/DOWN'}
}

initialState => {
    counter1: {counter:0},
    counter2: {counter:0}
}
*/
```

In the above example you will notice that we can also access the initialState, this allows Tiny Duck to compose and merge the actions and initialState.

In `actions` we can see that `TinyDuck` has automatically add the namespace of the sub state we declared. Eg: `{UP: 'counter1/UP', DOWN: 'counter1/DOWN'}`. This is how Tiny Duck can ensure isolation of action types.

When the action `{type: actions.counter1.UP}` is passed to the reducer, the action handler only operates on the sub state.

```javascript
const newState = reducer(initialState, {type: actions.counter1.UP});

/*
newState => {
    counter1: {counter:1},
    counter2: {counter:0}
}
*/
```

Absolute namespaces can be used to have an action be dispatched to many different action handlers operating on different parts of your redux state.

This is useful if you want one action to impact multiple parts of your state.

```javascript
const {reducer, actions, initialState} = TinyDuck({
   counter1: TinyDuck('/', counter),
   counter2: TinyDuck('/', counter)
});

/*
actions => {
    counter1: {UP: '/UP', DOWN: '/DOWN'}, 
    counter2: {UP: '/UP', DOWN: '/DOWN'}
}

initialState => {
    counter1: {counter:0},
    counter2: {counter:0}
}
*/
```

With the absolute namespace in place both `counter1` and `counter2` have the same namespaced action types. This means that when `{type: actions.counter1.UP}` is passed to the reducer, both handers for `/UP` will be triggered.

```javascript
const newState = reducer(initialState, {type: actions.counter1.UP});

/*
newState => {
    counter1: {counter:1},
    counter2: {counter:1}
}
*/
``` 

*WARNING:* Absolute namespaces are a double edge sword. You need to be very careful when using them. 

### License

MIT
