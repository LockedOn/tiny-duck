const mergeDucks = (...args) =>
  args.reduce((a = {}, b = {}) => {
    const initialState = {...a.initialState, ...b.initialState};
    const reducers = {...a.reducers, ...b.reducers};
    const actions = {...a.actions, ...b.actions};
    const reducer = (state = initialState, action) => {
      const func = reducers[action.type];
      return func && func(state, action) || state;
    };
    return {initialState, reducers, actions, reducer};
  }, {});

export default function TinyDuck(...args) {
  const ns = args[0];

  if (typeof ns !== 'string') {
    return TinyDuck.apply(this, [''].concat(args));
  }

  const namespace = (ns.slice(-1) === '/' || ns === '')?ns:`${ns}/`;

  return args.splice(1).map(duck => Object.keys(duck).reduce((d, key) => {
    if (key === 'initialState') {
      return d;
    }

    const obj = duck[key];
    const type = `${namespace}${key}`;

    if (Object.prototype.toString.call(obj) === '[object Function]') {
      return mergeDucks(d, {
        reducers: {[type]: obj},
        actions: {[key]: type},
      });
    }

    // Poetically Duck Typed
    if (obj.reducer && obj.reducers && obj.actions && obj.initialState) {
      const newNs = (act) => {
        if (act.substring(0, 1) === "/") {
          return act;
        }
        return `${type}/${act}`;
      };

      const importReducers = Object.keys(obj.reducers).reduce((a, r) => ({
        ...a,
        [newNs(r)]: (state, action) => ({
          ...state,
          [key]: obj.reducers[r](state[key], action),
        }),
      }), {});

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
  }, {initialState: (duck.initialState || {})})).reduce(mergeDucks, {});
}
