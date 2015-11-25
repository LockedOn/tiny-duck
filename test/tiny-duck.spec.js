import expect from 'expect';
import TinyDuck from '../src/index';

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
});

describe('composition', () => {
  it('Merge initialState with nesting preserved', () => {
    expect(initialState).toEqual({
      test1: false, 
      test2: false, 
      sub: {test3: false}, 
      sub2: {test4: false}, 
      sub3: {test5: false}
    });
  });
  it('Merge actions with nesting preserved + sub namespace', () => {
    expect(actions).toEqual({
      ONE: 'ns/ONE', 
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
  dispatch(null, null);

  it('`reducer` processed all actions + all actions correct', () => {
    expect(history).toEqual([ { test1: true,
    sub: { test3: false },
    sub2: { test4: false },
    sub3: { test5: false },
    test2: false,
    wow: true,
    type: 'ns/ONE' },
  { test1: true,
    sub: { test3: false },
    sub2: { test4: false },
    sub3: { test5: false },
    test2: false,
    wow: false,
    type: 'ns/ONE' },
  { test1: true,
    sub: { test3: true },
    sub2: { test4: false },
    sub3: { test5: false },
    test2: false,
    wow: false,
    type: 'ns/ONE' },
  { test1: true,
    sub: { test3: true },
    sub2: { test4: true },
    sub3: { test5: true },
    test2: false,
    wow: false,
    type: 'ns/ONE' },
  { test1: true,
    sub: { test3: true },
    sub2: { test4: true },
    sub3: { test5: true },
    test2: false,
    wow: false,
    type: 'ns/ONE' },
  { test1: true,
    sub: { test3: true },
    sub2: { test4: true },
    sub3: { test5: true },
    test2: false,
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
    });
  });
});
