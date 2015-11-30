const mergeDucks = (...args) =>
  args.reduce((a = {}, b = {}) => {
    // Directly merge initialState and actions
    const initialState = {...a.initialState, ...b.initialState};
    const actions = {...a.actions, ...b.actions};

    // Manually merge reducers
    const reducers = Object.keys(b.reducers || {}).reduce((reds, bkey) => {
      const ared = reds[bkey];
      const bred = b.reducers[bkey];
      return {
        ...reds,
        // If actions with the same name exist, wrap function composition in a new function
        //    this approach allows n number of actions to be chained together and not introduce
        //    a new data structure like arrays and loops to process actions.
        [bkey]: (ared && ((state, action) => {
          return bred(ared(state, action), action);
        }) || bred)
      };
    }, a.reducers || {});

    // Create new reducer for this newly merged TinyDuck
    const reducer = (state = initialState, action = {}) => {
      const func = reducers[action.type];
      return func && func(state, action) || state;
    };

    return {initialState, reducers, actions, reducer};
  }, {});

export default function TinyDuck(...args) {
  const ns = args[0];

  // ns is optional, if missing recure with default ns ''
  if (typeof ns !== 'string') {
    return TinyDuck.apply(this, [''].concat(args));
  }

  // Add tailing slash if missing and ns is supplied
  const namespace = (ns.slice(-1) === '/' || ns === '')?ns:`${ns}/`;

  // Allow many arity and merge resulting TinyDucks
  return args.splice(1).map(duck => {
    // If passing in an existing TinyDuck pass through for later merge.
    if (duck.reducer && duck.reducers && duck.actions && duck.initialState) {
      return duck;
    }
    return Object.keys(duck).reduce((d, key) => {
      if (key === 'initialState') {
        return d;
      }

      const obj = duck[key];
      const type = `${namespace}${key}`;

      // Create new duck action 
      if (Object.prototype.toString.call(obj) === '[object Function]') {
        return mergeDucks(d, {
          reducers: {[type]: obj},
          actions: {[key]: type},
        });
      }

      // Import sub duck if Poetically Duck Typed
      if (obj.reducer && obj.reducers && obj.actions && obj.initialState) {

        // Add parent namespace where not an abosolute action
        const newNs = (act) => {
          if (act.substring(0, 1) === "/") {
            return act;
          }
          return `${type}/${act}`;
        };

        // Wrap imported reducers to subset state
        const importReducers = Object.keys(obj.reducers).reduce((a, r) => ({
          ...a,
          [newNs(r)]: (state, action) => ({
            ...state,
            [key]: obj.reducers[r](state[key], action),
          }),
        }), {});

        // Compose actions in tree matching duck composition
        const importActions = Object.keys(obj.actions).reduce((a, r) => ({
          ...a,
          [r]: newNs(obj.actions[r]),
        }), {});

        return mergeDucks(d, {
          initialState: {[key]: obj.initialState},
          reducers: importReducers,
          actions: {[key]: importActions},
        });
      }

      throw new Error('TinyDuck action handlers must be a function or a TinyDuck!');
    }, {initialState: (duck.initialState || {})});
  }).reduce(mergeDucks, {});
}
