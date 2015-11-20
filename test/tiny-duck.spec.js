import expect from 'expect';
import TinyDuck from '../src/index';

const {reducer, actions, initialState} = TinyDuck('ns/', {
  initialState: {test1:false},
  ONE: (state, action) => ({...state, ...action, test1:true})
}, {
  sub: TinyDuck({
    initialState: {test3: false},
    ONE: (state, action) => ({...state, test3: true})
  })
}, {
  sub2: TinyDuck("/",{
    initialState: {test4: false},
    ONE: (state, action) => ({...state, test4: true})
  })
}, {
  initialState: {test2:false},
  TWO: (state, action) => state
});

describe('composition', () => {
  it('merge initialState with nesting preserved', () => {
    expect(initialState).toEqual({
      test1: false, 
      test2: false, 
      sub: {test3: false}, 
      sub2: {test4: false}
    });
  });
  it('merge actions with nesting preserved + sub namespace', () => {
    expect(actions).toEqual({
      ONE: 'ns/ONE', 
      sub: {ONE: 'ns/sub/ONE'}, 
      sub2: {ONE: '/ONE'}, 
      TWO: 'ns/TWO'
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
  dispatch(null, null);

  it('reducer processes all actions', () => {
    expect(history).toEqual([ { test1: true,
    sub: { test3: false },
    sub2: { test4: false },
    test2: false,
    wow: true,
    type: 'ns/ONE' },
  { test1: true,
    sub: { test3: false },
    sub2: { test4: false },
    test2: false,
    wow: false,
    type: 'ns/ONE' },
  { test1: true,
    sub: { test3: true },
    sub2: { test4: false },
    test2: false,
    wow: false,
    type: 'ns/ONE' },
  { test1: true,
    sub: { test3: true },
    sub2: { test4: true },
    test2: false,
    wow: false,
    type: 'ns/ONE' },
  { test1: true,
    sub: { test3: true },
    sub2: { test4: true },
    test2: false,
    wow: false,
    type: 'ns/ONE' } ,
  { test1: true,
    sub: { test3: true },
    sub2: { test4: true },
    test2: false,
    wow: false,
    type: 'ns/ONE' } ]);
  });
});
