import expect from 'expect';
import TinyDuck from '../src/index';
import {makeDuck} from '../src/index';

const {reducer, actions, initialState} = TinyDuck('ns', {
  initialState: {test1:false},
  ONE: (state, action) => ({...state, ...action, test1:true})
}, {
  sub: TinyDuck({
    initialState: {test3: false},
    ONE: (state, action) => ({...state, test3: true})
  })
}, {
  sub2: TinyDuck("/", {
    initialState: {test4: false},
    ONE: (state, action) => ({...state, test4: true})
  })
}, {
  sub3: TinyDuck("/", {
    initialState: {test5: false},
    ONE: (state, action) => ({...state, test5: true})
  })
}, {
  initialState: {test2:false},
  TWO: (state, action) => state
},
TinyDuck("/", {
  initialState: {top:false},
  TOP: (state, action) => ({...state, top:true})
}));

describe('composition', () => {
  it('Merge initialState with nesting preserved', () => {
    expect(initialState).toEqual({
      test1: false, 
      test2: false, 
      top: false, 
      sub: {test3: false}, 
      sub2: {test4: false}, 
      sub3: {test5: false}
    });
  });
  it('Merge actions with nesting preserved + sub namespace', () => {
    expect(actions).toEqual({
      ONE: 'ns/ONE', 
      TOP: '/TOP',
      sub: {ONE: 'ns/sub/ONE'}, 
      sub2: {ONE: '/ONE'}, 
      sub3: {ONE: '/ONE'}, 
      TWO: 'ns/TWO'
    });
  });
  it('Add tailing ns where required', () => {
    const part = {ONE: (state, action) => {}};
    expect(TinyDuck('ns', part).actions).toEqual(TinyDuck('ns/', part).actions);
  });
});


describe('pluggable-initialState-merge', () => {
  it('Custom mergeFn used.', () => {

    const mergeFn = (a, b) => {
      return {...a, ...b, custom:true};
    };

    const customDuck = makeDuck({
      initialStateMerge: mergeFn
    });

    const {initialState} = customDuck({
      initialState: {one:true}
    }, {
      initialState: {two:true}
    });
    
    expect(initialState).toEqual({
      custom: true,
      one: true,
      two: true
    });
  });
});

describe('dispatch', () => {
  const history = [];

  const dispatch = (action, payload) => {
    history.push(reducer(history.slice(-1)[0], {
      ...payload,
      type: action
    }));
  };

  dispatch(actions.ONE, {wow:true});
  dispatch(actions.ONE, {wow:false});
  dispatch(actions.sub.ONE, {});
  dispatch(actions.sub2.ONE, {});
  dispatch(actions.TWO, null);
  dispatch(actions.TOP, null);
  dispatch(null, null);

  it('`reducer` processed all actions + all actions correct', () => {
    expect(history).toEqual([ { test1: true,
    sub: { test3: false },
    sub2: { test4: false },
    sub3: { test5: false },
    test2: false,
    top: false,
    wow: true,
    type: 'ns/ONE' },
  { test1: true,
    sub: { test3: false },
    sub2: { test4: false },
    sub3: { test5: false },
    test2: false,
    top: false,
    wow: false,
    type: 'ns/ONE' },
  { test1: true,
    sub: { test3: true },
    sub2: { test4: false },
    sub3: { test5: false },
    test2: false,
    top: false,
    wow: false,
    type: 'ns/ONE' },
  { test1: true,
    sub: { test3: true },
    sub2: { test4: true },
    sub3: { test5: true },
    test2: false,
    top: false,
    wow: false,
    type: 'ns/ONE' },
  { test1: true,
    sub: { test3: true },
    sub2: { test4: true },
    sub3: { test5: true },
    test2: false,
    top: false,
    wow: false,
    type: 'ns/ONE' },
  { test1: true,
    sub: { test3: true },
    sub2: { test4: true },
    sub3: { test5: true },
    test2: false,
    top: true,
    wow: false,
    type: 'ns/ONE' },
  { test1: true,
    sub: { test3: true },
    sub2: { test4: true },
    sub3: { test5: true },
    test2: false,
    top: true,
    wow: false,
    type: 'ns/ONE' } ]);
  });

  it('Both actions with the absolute name are called in different namespace', () => {
    expect(reducer(undefined, {type: actions.sub2.ONE})).toEqual({ 
      test1: false,
      sub: { test3: false },
      sub2: { test4: true },
      sub3: { test5: true },
      test2: false,
      top: false,
    });
  });
});
