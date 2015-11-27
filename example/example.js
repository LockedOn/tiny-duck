import TinyDuck from '../src/index.js';

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

(function example1() {
	const {reducer, actions} = TinyDuck(counter);

	console.log(actions); // actions => {UP: 'UP', DOWN: 'DOWN'}
})();

(function example2() {
	const {reducer, actions} = TinyDuck(counter, {
	    RESET: (state, action) => ({counter:0})
	});

	console.log(actions); // actions => {UP: 'UP', DOWN: 'DOWN', RESET: 'RESET'}
})();

(function example3() {
	const {reducer, actions} = TinyDuck('ns', counter);

	console.log(actions); // actions => {UP: 'ns/UP', DOWN: 'ns/DOWN'}
})();

(function example4() {
	const {reducer, actions, initialState} = TinyDuck({
	   counter1: TinyDuck(counter),
	   counter2: TinyDuck(counter)
	});

	console.log(actions, initialState);
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

	const newState = reducer(initialState, {type: actions.counter1.UP});

	console.log(newState);
	/*
	newState => {
	    counter1: {counter:1},
	    counter2: {counter:0}
	}
	*/
})();

(function example4() {
	const {reducer, actions, initialState} = TinyDuck({
	   counter1: TinyDuck('/', counter),
	   counter2: TinyDuck('/', counter)
	});

	console.log(actions, initialState);
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

	const newState = reducer(initialState, {type: actions.counter1.UP});

	console.log(newState);
	/*
	newState => {
	    counter1: {counter:1},
	    counter2: {counter:1}
	}
	*/
})();