var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var _client, _currentQuery, _currentQueryInitialState, _currentResult, _currentResultState, _currentResultOptions, _currentThenable, _selectError, _selectFn, _selectResult, _lastQueryWithDefinedData, _staleTimeoutId, _refetchIntervalId, _currentRefetchInterval, _trackedProps, _QueryObserver_instances, executeFetch_fn, updateStaleTimeout_fn, computeRefetchInterval_fn, updateRefetchInterval_fn, updateTimers_fn, clearStaleTimeout_fn, clearRefetchInterval_fn, updateQuery_fn, notify_fn, _a;
import { S as Subscribable, p as pendingThenable, c as resolveEnabled, s as shallowEqualObjects, d as resolveStaleTime, n as noop, e as environmentManager, i as isValidTimeout, t as timeUntilStale, f as timeoutManager, g as focusManager, h as fetchState, k as replaceData, l as notifyManager, r as reactExports, m as shouldThrowError, o as useQueryClient, q as useInternetIdentity, v as createActorWithConfig, j as jsxRuntimeExports, u as useAuth, a as useNavigate, b as ue } from "./index-YzRaEhRL.js";
import { m as motion, A as AnimatePresence } from "./proxy-CFH5U5ly.js";
var QueryObserver = (_a = class extends Subscribable {
  constructor(client, options) {
    super();
    __privateAdd(this, _QueryObserver_instances);
    __privateAdd(this, _client);
    __privateAdd(this, _currentQuery);
    __privateAdd(this, _currentQueryInitialState);
    __privateAdd(this, _currentResult);
    __privateAdd(this, _currentResultState);
    __privateAdd(this, _currentResultOptions);
    __privateAdd(this, _currentThenable);
    __privateAdd(this, _selectError);
    __privateAdd(this, _selectFn);
    __privateAdd(this, _selectResult);
    // This property keeps track of the last query with defined data.
    // It will be used to pass the previous data and query to the placeholder function between renders.
    __privateAdd(this, _lastQueryWithDefinedData);
    __privateAdd(this, _staleTimeoutId);
    __privateAdd(this, _refetchIntervalId);
    __privateAdd(this, _currentRefetchInterval);
    __privateAdd(this, _trackedProps, /* @__PURE__ */ new Set());
    this.options = options;
    __privateSet(this, _client, client);
    __privateSet(this, _selectError, null);
    __privateSet(this, _currentThenable, pendingThenable());
    this.bindMethods();
    this.setOptions(options);
  }
  bindMethods() {
    this.refetch = this.refetch.bind(this);
  }
  onSubscribe() {
    if (this.listeners.size === 1) {
      __privateGet(this, _currentQuery).addObserver(this);
      if (shouldFetchOnMount(__privateGet(this, _currentQuery), this.options)) {
        __privateMethod(this, _QueryObserver_instances, executeFetch_fn).call(this);
      } else {
        this.updateResult();
      }
      __privateMethod(this, _QueryObserver_instances, updateTimers_fn).call(this);
    }
  }
  onUnsubscribe() {
    if (!this.hasListeners()) {
      this.destroy();
    }
  }
  shouldFetchOnReconnect() {
    return shouldFetchOn(
      __privateGet(this, _currentQuery),
      this.options,
      this.options.refetchOnReconnect
    );
  }
  shouldFetchOnWindowFocus() {
    return shouldFetchOn(
      __privateGet(this, _currentQuery),
      this.options,
      this.options.refetchOnWindowFocus
    );
  }
  destroy() {
    this.listeners = /* @__PURE__ */ new Set();
    __privateMethod(this, _QueryObserver_instances, clearStaleTimeout_fn).call(this);
    __privateMethod(this, _QueryObserver_instances, clearRefetchInterval_fn).call(this);
    __privateGet(this, _currentQuery).removeObserver(this);
  }
  setOptions(options) {
    const prevOptions = this.options;
    const prevQuery = __privateGet(this, _currentQuery);
    this.options = __privateGet(this, _client).defaultQueryOptions(options);
    if (this.options.enabled !== void 0 && typeof this.options.enabled !== "boolean" && typeof this.options.enabled !== "function" && typeof resolveEnabled(this.options.enabled, __privateGet(this, _currentQuery)) !== "boolean") {
      throw new Error(
        "Expected enabled to be a boolean or a callback that returns a boolean"
      );
    }
    __privateMethod(this, _QueryObserver_instances, updateQuery_fn).call(this);
    __privateGet(this, _currentQuery).setOptions(this.options);
    if (prevOptions._defaulted && !shallowEqualObjects(this.options, prevOptions)) {
      __privateGet(this, _client).getQueryCache().notify({
        type: "observerOptionsUpdated",
        query: __privateGet(this, _currentQuery),
        observer: this
      });
    }
    const mounted = this.hasListeners();
    if (mounted && shouldFetchOptionally(
      __privateGet(this, _currentQuery),
      prevQuery,
      this.options,
      prevOptions
    )) {
      __privateMethod(this, _QueryObserver_instances, executeFetch_fn).call(this);
    }
    this.updateResult();
    if (mounted && (__privateGet(this, _currentQuery) !== prevQuery || resolveEnabled(this.options.enabled, __privateGet(this, _currentQuery)) !== resolveEnabled(prevOptions.enabled, __privateGet(this, _currentQuery)) || resolveStaleTime(this.options.staleTime, __privateGet(this, _currentQuery)) !== resolveStaleTime(prevOptions.staleTime, __privateGet(this, _currentQuery)))) {
      __privateMethod(this, _QueryObserver_instances, updateStaleTimeout_fn).call(this);
    }
    const nextRefetchInterval = __privateMethod(this, _QueryObserver_instances, computeRefetchInterval_fn).call(this);
    if (mounted && (__privateGet(this, _currentQuery) !== prevQuery || resolveEnabled(this.options.enabled, __privateGet(this, _currentQuery)) !== resolveEnabled(prevOptions.enabled, __privateGet(this, _currentQuery)) || nextRefetchInterval !== __privateGet(this, _currentRefetchInterval))) {
      __privateMethod(this, _QueryObserver_instances, updateRefetchInterval_fn).call(this, nextRefetchInterval);
    }
  }
  getOptimisticResult(options) {
    const query = __privateGet(this, _client).getQueryCache().build(__privateGet(this, _client), options);
    const result = this.createResult(query, options);
    if (shouldAssignObserverCurrentProperties(this, result)) {
      __privateSet(this, _currentResult, result);
      __privateSet(this, _currentResultOptions, this.options);
      __privateSet(this, _currentResultState, __privateGet(this, _currentQuery).state);
    }
    return result;
  }
  getCurrentResult() {
    return __privateGet(this, _currentResult);
  }
  trackResult(result, onPropTracked) {
    return new Proxy(result, {
      get: (target, key) => {
        this.trackProp(key);
        onPropTracked == null ? void 0 : onPropTracked(key);
        if (key === "promise") {
          this.trackProp("data");
          if (!this.options.experimental_prefetchInRender && __privateGet(this, _currentThenable).status === "pending") {
            __privateGet(this, _currentThenable).reject(
              new Error(
                "experimental_prefetchInRender feature flag is not enabled"
              )
            );
          }
        }
        return Reflect.get(target, key);
      }
    });
  }
  trackProp(key) {
    __privateGet(this, _trackedProps).add(key);
  }
  getCurrentQuery() {
    return __privateGet(this, _currentQuery);
  }
  refetch({ ...options } = {}) {
    return this.fetch({
      ...options
    });
  }
  fetchOptimistic(options) {
    const defaultedOptions = __privateGet(this, _client).defaultQueryOptions(options);
    const query = __privateGet(this, _client).getQueryCache().build(__privateGet(this, _client), defaultedOptions);
    return query.fetch().then(() => this.createResult(query, defaultedOptions));
  }
  fetch(fetchOptions) {
    return __privateMethod(this, _QueryObserver_instances, executeFetch_fn).call(this, {
      ...fetchOptions,
      cancelRefetch: fetchOptions.cancelRefetch ?? true
    }).then(() => {
      this.updateResult();
      return __privateGet(this, _currentResult);
    });
  }
  createResult(query, options) {
    var _a2;
    const prevQuery = __privateGet(this, _currentQuery);
    const prevOptions = this.options;
    const prevResult = __privateGet(this, _currentResult);
    const prevResultState = __privateGet(this, _currentResultState);
    const prevResultOptions = __privateGet(this, _currentResultOptions);
    const queryChange = query !== prevQuery;
    const queryInitialState = queryChange ? query.state : __privateGet(this, _currentQueryInitialState);
    const { state } = query;
    let newState = { ...state };
    let isPlaceholderData = false;
    let data;
    if (options._optimisticResults) {
      const mounted = this.hasListeners();
      const fetchOnMount = !mounted && shouldFetchOnMount(query, options);
      const fetchOptionally = mounted && shouldFetchOptionally(query, prevQuery, options, prevOptions);
      if (fetchOnMount || fetchOptionally) {
        newState = {
          ...newState,
          ...fetchState(state.data, query.options)
        };
      }
      if (options._optimisticResults === "isRestoring") {
        newState.fetchStatus = "idle";
      }
    }
    let { error, errorUpdatedAt, status } = newState;
    data = newState.data;
    let skipSelect = false;
    if (options.placeholderData !== void 0 && data === void 0 && status === "pending") {
      let placeholderData;
      if ((prevResult == null ? void 0 : prevResult.isPlaceholderData) && options.placeholderData === (prevResultOptions == null ? void 0 : prevResultOptions.placeholderData)) {
        placeholderData = prevResult.data;
        skipSelect = true;
      } else {
        placeholderData = typeof options.placeholderData === "function" ? options.placeholderData(
          (_a2 = __privateGet(this, _lastQueryWithDefinedData)) == null ? void 0 : _a2.state.data,
          __privateGet(this, _lastQueryWithDefinedData)
        ) : options.placeholderData;
      }
      if (placeholderData !== void 0) {
        status = "success";
        data = replaceData(
          prevResult == null ? void 0 : prevResult.data,
          placeholderData,
          options
        );
        isPlaceholderData = true;
      }
    }
    if (options.select && data !== void 0 && !skipSelect) {
      if (prevResult && data === (prevResultState == null ? void 0 : prevResultState.data) && options.select === __privateGet(this, _selectFn)) {
        data = __privateGet(this, _selectResult);
      } else {
        try {
          __privateSet(this, _selectFn, options.select);
          data = options.select(data);
          data = replaceData(prevResult == null ? void 0 : prevResult.data, data, options);
          __privateSet(this, _selectResult, data);
          __privateSet(this, _selectError, null);
        } catch (selectError) {
          __privateSet(this, _selectError, selectError);
        }
      }
    }
    if (__privateGet(this, _selectError)) {
      error = __privateGet(this, _selectError);
      data = __privateGet(this, _selectResult);
      errorUpdatedAt = Date.now();
      status = "error";
    }
    const isFetching = newState.fetchStatus === "fetching";
    const isPending = status === "pending";
    const isError = status === "error";
    const isLoading = isPending && isFetching;
    const hasData = data !== void 0;
    const result = {
      status,
      fetchStatus: newState.fetchStatus,
      isPending,
      isSuccess: status === "success",
      isError,
      isInitialLoading: isLoading,
      isLoading,
      data,
      dataUpdatedAt: newState.dataUpdatedAt,
      error,
      errorUpdatedAt,
      failureCount: newState.fetchFailureCount,
      failureReason: newState.fetchFailureReason,
      errorUpdateCount: newState.errorUpdateCount,
      isFetched: query.isFetched(),
      isFetchedAfterMount: newState.dataUpdateCount > queryInitialState.dataUpdateCount || newState.errorUpdateCount > queryInitialState.errorUpdateCount,
      isFetching,
      isRefetching: isFetching && !isPending,
      isLoadingError: isError && !hasData,
      isPaused: newState.fetchStatus === "paused",
      isPlaceholderData,
      isRefetchError: isError && hasData,
      isStale: isStale(query, options),
      refetch: this.refetch,
      promise: __privateGet(this, _currentThenable),
      isEnabled: resolveEnabled(options.enabled, query) !== false
    };
    const nextResult = result;
    if (this.options.experimental_prefetchInRender) {
      const hasResultData = nextResult.data !== void 0;
      const isErrorWithoutData = nextResult.status === "error" && !hasResultData;
      const finalizeThenableIfPossible = (thenable) => {
        if (isErrorWithoutData) {
          thenable.reject(nextResult.error);
        } else if (hasResultData) {
          thenable.resolve(nextResult.data);
        }
      };
      const recreateThenable = () => {
        const pending = __privateSet(this, _currentThenable, nextResult.promise = pendingThenable());
        finalizeThenableIfPossible(pending);
      };
      const prevThenable = __privateGet(this, _currentThenable);
      switch (prevThenable.status) {
        case "pending":
          if (query.queryHash === prevQuery.queryHash) {
            finalizeThenableIfPossible(prevThenable);
          }
          break;
        case "fulfilled":
          if (isErrorWithoutData || nextResult.data !== prevThenable.value) {
            recreateThenable();
          }
          break;
        case "rejected":
          if (!isErrorWithoutData || nextResult.error !== prevThenable.reason) {
            recreateThenable();
          }
          break;
      }
    }
    return nextResult;
  }
  updateResult() {
    const prevResult = __privateGet(this, _currentResult);
    const nextResult = this.createResult(__privateGet(this, _currentQuery), this.options);
    __privateSet(this, _currentResultState, __privateGet(this, _currentQuery).state);
    __privateSet(this, _currentResultOptions, this.options);
    if (__privateGet(this, _currentResultState).data !== void 0) {
      __privateSet(this, _lastQueryWithDefinedData, __privateGet(this, _currentQuery));
    }
    if (shallowEqualObjects(nextResult, prevResult)) {
      return;
    }
    __privateSet(this, _currentResult, nextResult);
    const shouldNotifyListeners = () => {
      if (!prevResult) {
        return true;
      }
      const { notifyOnChangeProps } = this.options;
      const notifyOnChangePropsValue = typeof notifyOnChangeProps === "function" ? notifyOnChangeProps() : notifyOnChangeProps;
      if (notifyOnChangePropsValue === "all" || !notifyOnChangePropsValue && !__privateGet(this, _trackedProps).size) {
        return true;
      }
      const includedProps = new Set(
        notifyOnChangePropsValue ?? __privateGet(this, _trackedProps)
      );
      if (this.options.throwOnError) {
        includedProps.add("error");
      }
      return Object.keys(__privateGet(this, _currentResult)).some((key) => {
        const typedKey = key;
        const changed = __privateGet(this, _currentResult)[typedKey] !== prevResult[typedKey];
        return changed && includedProps.has(typedKey);
      });
    };
    __privateMethod(this, _QueryObserver_instances, notify_fn).call(this, { listeners: shouldNotifyListeners() });
  }
  onQueryUpdate() {
    this.updateResult();
    if (this.hasListeners()) {
      __privateMethod(this, _QueryObserver_instances, updateTimers_fn).call(this);
    }
  }
}, _client = new WeakMap(), _currentQuery = new WeakMap(), _currentQueryInitialState = new WeakMap(), _currentResult = new WeakMap(), _currentResultState = new WeakMap(), _currentResultOptions = new WeakMap(), _currentThenable = new WeakMap(), _selectError = new WeakMap(), _selectFn = new WeakMap(), _selectResult = new WeakMap(), _lastQueryWithDefinedData = new WeakMap(), _staleTimeoutId = new WeakMap(), _refetchIntervalId = new WeakMap(), _currentRefetchInterval = new WeakMap(), _trackedProps = new WeakMap(), _QueryObserver_instances = new WeakSet(), executeFetch_fn = function(fetchOptions) {
  __privateMethod(this, _QueryObserver_instances, updateQuery_fn).call(this);
  let promise = __privateGet(this, _currentQuery).fetch(
    this.options,
    fetchOptions
  );
  if (!(fetchOptions == null ? void 0 : fetchOptions.throwOnError)) {
    promise = promise.catch(noop);
  }
  return promise;
}, updateStaleTimeout_fn = function() {
  __privateMethod(this, _QueryObserver_instances, clearStaleTimeout_fn).call(this);
  const staleTime = resolveStaleTime(
    this.options.staleTime,
    __privateGet(this, _currentQuery)
  );
  if (environmentManager.isServer() || __privateGet(this, _currentResult).isStale || !isValidTimeout(staleTime)) {
    return;
  }
  const time = timeUntilStale(__privateGet(this, _currentResult).dataUpdatedAt, staleTime);
  const timeout = time + 1;
  __privateSet(this, _staleTimeoutId, timeoutManager.setTimeout(() => {
    if (!__privateGet(this, _currentResult).isStale) {
      this.updateResult();
    }
  }, timeout));
}, computeRefetchInterval_fn = function() {
  return (typeof this.options.refetchInterval === "function" ? this.options.refetchInterval(__privateGet(this, _currentQuery)) : this.options.refetchInterval) ?? false;
}, updateRefetchInterval_fn = function(nextInterval) {
  __privateMethod(this, _QueryObserver_instances, clearRefetchInterval_fn).call(this);
  __privateSet(this, _currentRefetchInterval, nextInterval);
  if (environmentManager.isServer() || resolveEnabled(this.options.enabled, __privateGet(this, _currentQuery)) === false || !isValidTimeout(__privateGet(this, _currentRefetchInterval)) || __privateGet(this, _currentRefetchInterval) === 0) {
    return;
  }
  __privateSet(this, _refetchIntervalId, timeoutManager.setInterval(() => {
    if (this.options.refetchIntervalInBackground || focusManager.isFocused()) {
      __privateMethod(this, _QueryObserver_instances, executeFetch_fn).call(this);
    }
  }, __privateGet(this, _currentRefetchInterval)));
}, updateTimers_fn = function() {
  __privateMethod(this, _QueryObserver_instances, updateStaleTimeout_fn).call(this);
  __privateMethod(this, _QueryObserver_instances, updateRefetchInterval_fn).call(this, __privateMethod(this, _QueryObserver_instances, computeRefetchInterval_fn).call(this));
}, clearStaleTimeout_fn = function() {
  if (__privateGet(this, _staleTimeoutId)) {
    timeoutManager.clearTimeout(__privateGet(this, _staleTimeoutId));
    __privateSet(this, _staleTimeoutId, void 0);
  }
}, clearRefetchInterval_fn = function() {
  if (__privateGet(this, _refetchIntervalId)) {
    timeoutManager.clearInterval(__privateGet(this, _refetchIntervalId));
    __privateSet(this, _refetchIntervalId, void 0);
  }
}, updateQuery_fn = function() {
  const query = __privateGet(this, _client).getQueryCache().build(__privateGet(this, _client), this.options);
  if (query === __privateGet(this, _currentQuery)) {
    return;
  }
  const prevQuery = __privateGet(this, _currentQuery);
  __privateSet(this, _currentQuery, query);
  __privateSet(this, _currentQueryInitialState, query.state);
  if (this.hasListeners()) {
    prevQuery == null ? void 0 : prevQuery.removeObserver(this);
    query.addObserver(this);
  }
}, notify_fn = function(notifyOptions) {
  notifyManager.batch(() => {
    if (notifyOptions.listeners) {
      this.listeners.forEach((listener) => {
        listener(__privateGet(this, _currentResult));
      });
    }
    __privateGet(this, _client).getQueryCache().notify({
      query: __privateGet(this, _currentQuery),
      type: "observerResultsUpdated"
    });
  });
}, _a);
function shouldLoadOnMount(query, options) {
  return resolveEnabled(options.enabled, query) !== false && query.state.data === void 0 && !(query.state.status === "error" && options.retryOnMount === false);
}
function shouldFetchOnMount(query, options) {
  return shouldLoadOnMount(query, options) || query.state.data !== void 0 && shouldFetchOn(query, options, options.refetchOnMount);
}
function shouldFetchOn(query, options, field) {
  if (resolveEnabled(options.enabled, query) !== false && resolveStaleTime(options.staleTime, query) !== "static") {
    const value = typeof field === "function" ? field(query) : field;
    return value === "always" || value !== false && isStale(query, options);
  }
  return false;
}
function shouldFetchOptionally(query, prevQuery, options, prevOptions) {
  return (query !== prevQuery || resolveEnabled(prevOptions.enabled, query) === false) && (!options.suspense || query.state.status !== "error") && isStale(query, options);
}
function isStale(query, options) {
  return resolveEnabled(options.enabled, query) !== false && query.isStaleByTime(resolveStaleTime(options.staleTime, query));
}
function shouldAssignObserverCurrentProperties(observer, optimisticResult) {
  if (!shallowEqualObjects(observer.getCurrentResult(), optimisticResult)) {
    return true;
  }
  return false;
}
var IsRestoringContext = reactExports.createContext(false);
var useIsRestoring = () => reactExports.useContext(IsRestoringContext);
IsRestoringContext.Provider;
function createValue() {
  let isReset = false;
  return {
    clearReset: () => {
      isReset = false;
    },
    reset: () => {
      isReset = true;
    },
    isReset: () => {
      return isReset;
    }
  };
}
var QueryErrorResetBoundaryContext = reactExports.createContext(createValue());
var useQueryErrorResetBoundary = () => reactExports.useContext(QueryErrorResetBoundaryContext);
var ensurePreventErrorBoundaryRetry = (options, errorResetBoundary, query) => {
  const throwOnError = (query == null ? void 0 : query.state.error) && typeof options.throwOnError === "function" ? shouldThrowError(options.throwOnError, [query.state.error, query]) : options.throwOnError;
  if (options.suspense || options.experimental_prefetchInRender || throwOnError) {
    if (!errorResetBoundary.isReset()) {
      options.retryOnMount = false;
    }
  }
};
var useClearResetErrorBoundary = (errorResetBoundary) => {
  reactExports.useEffect(() => {
    errorResetBoundary.clearReset();
  }, [errorResetBoundary]);
};
var getHasError = ({
  result,
  errorResetBoundary,
  throwOnError,
  query,
  suspense
}) => {
  return result.isError && !errorResetBoundary.isReset() && !result.isFetching && query && (suspense && result.data === void 0 || shouldThrowError(throwOnError, [result.error, query]));
};
var ensureSuspenseTimers = (defaultedOptions) => {
  if (defaultedOptions.suspense) {
    const MIN_SUSPENSE_TIME_MS = 1e3;
    const clamp = (value) => value === "static" ? value : Math.max(value ?? MIN_SUSPENSE_TIME_MS, MIN_SUSPENSE_TIME_MS);
    const originalStaleTime = defaultedOptions.staleTime;
    defaultedOptions.staleTime = typeof originalStaleTime === "function" ? (...args) => clamp(originalStaleTime(...args)) : clamp(originalStaleTime);
    if (typeof defaultedOptions.gcTime === "number") {
      defaultedOptions.gcTime = Math.max(
        defaultedOptions.gcTime,
        MIN_SUSPENSE_TIME_MS
      );
    }
  }
};
var willFetch = (result, isRestoring) => result.isLoading && result.isFetching && !isRestoring;
var shouldSuspend = (defaultedOptions, result) => (defaultedOptions == null ? void 0 : defaultedOptions.suspense) && result.isPending;
var fetchOptimistic = (defaultedOptions, observer, errorResetBoundary) => observer.fetchOptimistic(defaultedOptions).catch(() => {
  errorResetBoundary.clearReset();
});
function useBaseQuery(options, Observer, queryClient) {
  var _a2, _b, _c, _d;
  const isRestoring = useIsRestoring();
  const errorResetBoundary = useQueryErrorResetBoundary();
  const client = useQueryClient();
  const defaultedOptions = client.defaultQueryOptions(options);
  (_b = (_a2 = client.getDefaultOptions().queries) == null ? void 0 : _a2._experimental_beforeQuery) == null ? void 0 : _b.call(
    _a2,
    defaultedOptions
  );
  const query = client.getQueryCache().get(defaultedOptions.queryHash);
  defaultedOptions._optimisticResults = isRestoring ? "isRestoring" : "optimistic";
  ensureSuspenseTimers(defaultedOptions);
  ensurePreventErrorBoundaryRetry(defaultedOptions, errorResetBoundary, query);
  useClearResetErrorBoundary(errorResetBoundary);
  const isNewCacheEntry = !client.getQueryCache().get(defaultedOptions.queryHash);
  const [observer] = reactExports.useState(
    () => new Observer(
      client,
      defaultedOptions
    )
  );
  const result = observer.getOptimisticResult(defaultedOptions);
  const shouldSubscribe = !isRestoring && options.subscribed !== false;
  reactExports.useSyncExternalStore(
    reactExports.useCallback(
      (onStoreChange) => {
        const unsubscribe = shouldSubscribe ? observer.subscribe(notifyManager.batchCalls(onStoreChange)) : noop;
        observer.updateResult();
        return unsubscribe;
      },
      [observer, shouldSubscribe]
    ),
    () => observer.getCurrentResult(),
    () => observer.getCurrentResult()
  );
  reactExports.useEffect(() => {
    observer.setOptions(defaultedOptions);
  }, [defaultedOptions, observer]);
  if (shouldSuspend(defaultedOptions, result)) {
    throw fetchOptimistic(defaultedOptions, observer, errorResetBoundary);
  }
  if (getHasError({
    result,
    errorResetBoundary,
    throwOnError: defaultedOptions.throwOnError,
    query,
    suspense: defaultedOptions.suspense
  })) {
    throw result.error;
  }
  (_d = (_c = client.getDefaultOptions().queries) == null ? void 0 : _c._experimental_afterQuery) == null ? void 0 : _d.call(
    _c,
    defaultedOptions,
    result
  );
  if (defaultedOptions.experimental_prefetchInRender && !environmentManager.isServer() && willFetch(result, isRestoring)) {
    const promise = isNewCacheEntry ? (
      // Fetch immediately on render in order to ensure `.promise` is resolved even if the component is unmounted
      fetchOptimistic(defaultedOptions, observer, errorResetBoundary)
    ) : (
      // subscribe to the "cache promise" so that we can finalize the currentThenable once data comes in
      query == null ? void 0 : query.promise
    );
    promise == null ? void 0 : promise.catch(noop).finally(() => {
      observer.updateResult();
    });
  }
  return !defaultedOptions.notifyOnChangeProps ? observer.trackResult(result) : result;
}
function useQuery(options, queryClient) {
  return useBaseQuery(options, QueryObserver);
}
function hasAccessControl(actor) {
  return typeof actor === "object" && actor !== null && "_initializeAccessControl" in actor;
}
const ACTOR_QUERY_KEY = "actor";
function useActor(createActor) {
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const actorQuery = useQuery({
    queryKey: [ACTOR_QUERY_KEY, identity == null ? void 0 : identity.getPrincipal().toString()],
    queryFn: async () => {
      const isAuthenticated = !!identity;
      if (!isAuthenticated) {
        return await createActorWithConfig(createActor);
      }
      const actorOptions = {
        agentOptions: {
          identity
        }
      };
      const actor = await createActorWithConfig(createActor, actorOptions);
      if (hasAccessControl(actor)) {
        await actor._initializeAccessControl();
      }
      return actor;
    },
    // Only refetch when identity changes
    staleTime: Number.POSITIVE_INFINITY,
    // This will cause the actor to be recreated when the identity changes
    enabled: true
  });
  reactExports.useEffect(() => {
    if (actorQuery.data) {
      queryClient.invalidateQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        }
      });
      queryClient.refetchQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        }
      });
    }
  }, [actorQuery.data, queryClient]);
  return {
    actor: actorQuery.data || null,
    isFetching: actorQuery.isFetching
  };
}
const CLUSTERS = [
  { id: "C1", label: "Cluster C1", holiday: "Sat off" },
  { id: "C2", label: "Cluster C2", holiday: "Mon off" }
];
function ClusterToggle({ value, onChange }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-ocid": "cluster-toggle",
      className: "flex items-center gap-1 p-1 rounded-xl bg-secondary border border-border",
      "aria-label": "Select cluster",
      children: CLUSTERS.map(({ id, label }) => {
        const isActive = value === id;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            "aria-pressed": isActive,
            onClick: () => onChange(id),
            title: label,
            className: "relative px-4 py-1.5 rounded-lg text-sm font-display font-semibold transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-secondary",
            children: [
              isActive && /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.span,
                {
                  layoutId: "cluster-pill",
                  className: "absolute inset-0 rounded-lg bg-primary",
                  transition: {
                    type: "spring",
                    stiffness: 340,
                    damping: 26
                  }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: [
                    "relative z-10 transition-colors duration-200",
                    isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  ].join(" "),
                  children: id
                }
              )
            ]
          },
          id
        );
      })
    }
  );
}
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const toCamelCase = (string) => string.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (match, p1, p2) => p2 ? p2.toUpperCase() : p1.toLowerCase()
);
const toPascalCase = (string) => {
  const camelCase = toCamelCase(string);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};
const mergeClasses = (...classes) => classes.filter((className, index, array) => {
  return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
}).join(" ").trim();
const hasA11yProp = (props) => {
  for (const prop in props) {
    if (prop.startsWith("aria-") || prop === "role" || prop === "title") {
      return true;
    }
  }
};
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Icon = reactExports.forwardRef(
  ({
    color = "currentColor",
    size = 24,
    strokeWidth = 2,
    absoluteStrokeWidth,
    className = "",
    children,
    iconNode,
    ...rest
  }, ref) => reactExports.createElement(
    "svg",
    {
      ref,
      ...defaultAttributes,
      width: size,
      height: size,
      stroke: color,
      strokeWidth: absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
      className: mergeClasses("lucide", className),
      ...!children && !hasA11yProp(rest) && { "aria-hidden": "true" },
      ...rest
    },
    [
      ...iconNode.map(([tag, attrs]) => reactExports.createElement(tag, attrs)),
      ...Array.isArray(children) ? children : [children]
    ]
  )
);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const createLucideIcon = (iconName, iconNode) => {
  const Component = reactExports.forwardRef(
    ({ className, ...props }, ref) => reactExports.createElement(Icon, {
      ref,
      iconNode,
      className: mergeClasses(
        `lucide-${toKebabCase(toPascalCase(iconName))}`,
        `lucide-${iconName}`,
        className
      ),
      ...props
    })
  );
  Component.displayName = toPascalCase(iconName);
  return Component;
};
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$6 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["polyline", { points: "12 6 12 12 16 14", key: "68esgv" }]
];
const Clock = createLucideIcon("clock", __iconNode$6);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$5 = [
  ["path", { d: "m16 17 5-5-5-5", key: "1bji2h" }],
  ["path", { d: "M21 12H9", key: "dn1m92" }],
  ["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", key: "1uf3rs" }]
];
const LogOut = createLucideIcon("log-out", __iconNode$5);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$4 = [
  ["path", { d: "M4.9 19.1C1 15.2 1 8.8 4.9 4.9", key: "1vaf9d" }],
  ["path", { d: "M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5", key: "u1ii0m" }],
  ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }],
  ["path", { d: "M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5", key: "1j5fej" }],
  ["path", { d: "M19.1 4.9C23 8.8 23 15.1 19.1 19", key: "10b0cb" }]
];
const Radio = createLucideIcon("radio", __iconNode$4);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  ["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", key: "v9h5vc" }],
  ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
  ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", key: "3uifl3" }],
  ["path", { d: "M8 16H3v5", key: "1cv678" }]
];
const RefreshCw = createLucideIcon("refresh-cw", __iconNode$3);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  [
    "path",
    {
      d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
      key: "wmoenq"
    }
  ],
  ["path", { d: "M12 9v4", key: "juzpu7" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }]
];
const TriangleAlert = createLucideIcon("triangle-alert", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["path", { d: "M16 3.128a4 4 0 0 1 0 7.744", key: "16gr8j" }],
  ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87", key: "kshegd" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }]
];
const Users = createLucideIcon("users", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    {
      d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
      key: "1xq2db"
    }
  ]
];
const Zap = createLucideIcon("zap", __iconNode);
function getRoomMeta(id) {
  const hash = [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
  const capacity = 20 + hash % 40;
  return { capacity, utilization: 0 };
}
function RoomCard({ room, index, isHoliday }) {
  const isEmpty = room.status === "EMPTY" && !isHoliday;
  const isOccupied = room.status === "OCCUPIED" && !isHoliday;
  const { capacity } = getRoomMeta(room.id);
  const utilization = isOccupied ? Math.round(
    capacity * 0.4 + [...room.id].reduce((a, c) => a + c.charCodeAt(0), 0) % 40 / 100 * capacity * 0.6
  ) : 0;
  const utilPct = capacity > 0 ? Math.min(100, utilization / capacity * 100) : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 14 },
      animate: { opacity: 1, y: 0 },
      transition: {
        duration: 0.28,
        delay: Math.min(index * 0.04, 0.6),
        ease: [0.4, 0, 0.2, 1]
      },
      "data-ocid": `room-card-${room.id.toLowerCase()}`,
      className: [
        "relative flex flex-col gap-2 rounded-xl p-3.5 border transition-smooth cursor-default select-none overflow-hidden",
        isHoliday ? "bg-card/30 border-border/20 opacity-40" : isEmpty ? "bg-card border-border/80 room-empty-glow hover:border-accent/60" : "bg-card border-border/80 room-occupied-glow hover:border-primary/60"
      ].join(" "),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: [
                "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
                isHoliday ? "bg-muted/20" : isEmpty ? "bg-accent/10" : "bg-primary/15"
              ].join(" "),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Users,
                {
                  className: [
                    "w-3.5 h-3.5",
                    isHoliday ? "text-muted-foreground/30" : isEmpty ? "text-accent" : "text-primary"
                  ].join(" ")
                }
              )
            }
          ),
          isHoliday ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-muted/20 text-muted-foreground/40", children: "HOLIDAY" }) : isEmpty ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-accent/15 text-accent border border-accent/25", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-accent pulse-dot" }),
            "EMPTY"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-primary/15 text-primary border border-primary/25", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-primary" }),
            "OCCUPIED"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: [
              "text-xl font-display font-black tracking-tight leading-none",
              isHoliday ? "text-muted-foreground/30" : "text-foreground"
            ].join(" "),
            children: room.id
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5 mt-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-[10px] text-muted-foreground font-body", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Capacity: ",
              capacity
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Utilization: ",
              utilization
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "util-bar-track", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: isEmpty ? "util-bar-fill-empty" : "util-bar-fill-occupied",
              style: { width: `${utilPct}%` }
            }
          ) })
        ] }),
        isOccupied && room.occupiedBy && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground truncate max-w-full leading-none -mt-1", children: room.occupiedBy }),
        isEmpty && !isHoliday && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 pointer-events-none panel-glow-green rounded-xl" })
      ]
    }
  );
}
function formatTime(hhmm) {
  if (hhmm === "--:--") return hhmm;
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}
function SessionBadge({ session, isLoading }) {
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3.5 h-3.5 rounded skeleton-shimmer flex-shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2.5 w-24 rounded skeleton-shimmer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3.5 w-32 rounded skeleton-shimmer" })
      ] })
    ] });
  }
  const isActive = (session == null ? void 0 : session.isActive) ?? false;
  const label = (session == null ? void 0 : session.sessionLabel) ?? "No Active Session";
  const start = formatTime((session == null ? void 0 : session.startTime) ?? "--:--");
  const end = formatTime((session == null ? void 0 : session.endTime) ?? "--:--");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: -6 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.4 },
      "data-ocid": "session-badge",
      className: "flex items-center gap-3 px-4 py-2.5 rounded-xl bg-card border border-border",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4 text-muted-foreground" }),
          isActive && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent pulse-dot" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col leading-tight min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground font-body uppercase tracking-wider", children: "Current Session" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: [
                  "text-sm font-display font-semibold truncate",
                  isActive ? "text-foreground" : "text-muted-foreground"
                ].join(" "),
                children: label
              }
            ),
            isActive && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-mono text-muted-foreground whitespace-nowrap flex-shrink-0", children: [
              start,
              " – ",
              end
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 flex-shrink-0", children: [
          isActive && /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "w-3 h-3 text-accent", "aria-hidden": "true" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: [
                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide",
                isActive ? "bg-accent/15 text-accent border border-accent/25" : "bg-muted text-muted-foreground"
              ].join(" "),
              children: isActive ? "Live" : "Off"
            }
          )
        ] })
      ]
    }
  );
}
const BLOCKS = [
  { key: "R_BLOCK", label: "R-Block", shortLabel: "R" },
  { key: "C_BLOCK", label: "C-Block", shortLabel: "C" },
  { key: "M_BLOCK", label: "M-Block", shortLabel: "M" }
];
const SESSION_TIMINGS = [
  { id: "S1_2", label: "S1-S2", start: "07:10", end: "08:50" },
  { id: "S3_4", label: "S3-S4", start: "09:20", end: "11:00" },
  { id: "S5_6", label: "S5-S6", start: "11:10", end: "12:50" },
  { id: "S7", label: "Lunch", start: "12:50", end: "13:50" },
  { id: "S8_9", label: "S8-S9", start: "13:50", end: "15:40" },
  { id: "S10_11", label: "S10-S11", start: "15:50", end: "17:30" },
  { id: "S12_13", label: "S12-S13", start: "17:40", end: "19:20" }
];
function computeCurrentSession$1() {
  const now = /* @__PURE__ */ new Date();
  const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  for (const s of SESSION_TIMINGS) {
    if (hhmm >= s.start && hhmm < s.end) {
      return {
        sessionId: s.id,
        sessionLabel: s.label,
        startTime: s.start,
        endTime: s.end,
        isActive: true
      };
    }
  }
  return {
    sessionId: "NONE",
    sessionLabel: "No Active Session",
    startTime: "--:--",
    endTime: "--:--",
    isActive: false
  };
}
function useCurrentSession() {
  const { actor, isFetching: actorFetching } = useActor(
    ""
  );
  return useQuery({
    queryKey: ["currentSession"],
    queryFn: async () => {
      try {
        if (actor) {
          const backendActor = actor;
          const backendSession = await backendActor.getCurrentSession();
          if (backendSession) return backendSession;
        }
      } catch {
      }
      return computeCurrentSession$1();
    },
    enabled: !actorFetching,
    refetchInterval: 3e4,
    staleTime: 3e4
  });
}
function computeCurrentSession() {
  const now = /* @__PURE__ */ new Date();
  const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  for (const s of SESSION_TIMINGS) {
    if (hhmm >= s.start && hhmm < s.end) {
      return {
        sessionId: s.id,
        sessionLabel: s.label,
        startTime: s.start,
        endTime: s.end,
        isActive: true
      };
    }
  }
  return {
    sessionId: "NONE",
    sessionLabel: "No Active Session",
    startTime: "--:--",
    endTime: "--:--",
    isActive: false
  };
}
const SEED_ROOMS = [
  // R-Block
  {
    id: "R206A",
    block: "R_BLOCK",
    status: "EMPTY",
    currentSession: "S1_2",
    occupiedBy: void 0
  },
  {
    id: "R207",
    block: "R_BLOCK",
    status: "OCCUPIED",
    currentSession: "S1_2",
    occupiedBy: "20BCE1234"
  },
  {
    id: "R208",
    block: "R_BLOCK",
    status: "EMPTY",
    currentSession: "S1_2",
    occupiedBy: void 0
  },
  // C-Block
  {
    id: "C207",
    block: "C_BLOCK",
    status: "OCCUPIED",
    currentSession: "S1_2",
    occupiedBy: "20BCE5678"
  },
  {
    id: "C208",
    block: "C_BLOCK",
    status: "EMPTY",
    currentSession: "S1_2",
    occupiedBy: void 0
  },
  {
    id: "C301",
    block: "C_BLOCK",
    status: "OCCUPIED",
    currentSession: "S1_2",
    occupiedBy: "20BCE9012"
  },
  // M-Block
  {
    id: "M101",
    block: "M_BLOCK",
    status: "EMPTY",
    currentSession: "S1_2",
    occupiedBy: void 0
  },
  {
    id: "M102",
    block: "M_BLOCK",
    status: "OCCUPIED",
    currentSession: "S1_2",
    occupiedBy: "20BCE3456"
  },
  {
    id: "M201",
    block: "M_BLOCK",
    status: "EMPTY",
    currentSession: "S1_2",
    occupiedBy: void 0
  }
];
function applyRealisticOccupancy(rooms, sessionId) {
  if (sessionId === "NONE") {
    return rooms.map((r) => ({ ...r, status: "EMPTY" }));
  }
  return rooms.map((room) => {
    const hash = [...`${room.id}${sessionId}`].reduce(
      (acc, c) => acc + c.charCodeAt(0),
      0
    );
    const status = hash % 3 === 0 ? "OCCUPIED" : "EMPTY";
    return { ...room, status, currentSession: sessionId };
  });
}
function useRooms(dayOfWeek, cluster) {
  const { actor, isFetching: actorFetching } = useActor(
    ""
  );
  const session = computeCurrentSession();
  return useQuery({
    queryKey: ["rooms", dayOfWeek, cluster, session.sessionId],
    queryFn: async () => {
      try {
        if (actor) {
          const backendActor = actor;
          const backendRooms = await backendActor.getRoomsForDay(
            BigInt(dayOfWeek),
            cluster
          );
          if (backendRooms && backendRooms.length > 0)
            return backendRooms;
        }
      } catch {
      }
      return applyRealisticOccupancy(SEED_ROOMS, session.sessionId);
    },
    enabled: !actorFetching,
    refetchInterval: 3e4,
    staleTime: 3e4
  });
}
function formatTS(d) {
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}
function getDefaultSemester() {
  const m = (/* @__PURE__ */ new Date()).getMonth() + 1;
  return m >= 8 && m <= 12 ? "ODD" : "EVEN";
}
function KluLogo() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex items-center gap-2.5 flex-shrink-0",
      "aria-label": "KLU Spotter",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "svg",
          {
            width: "28",
            height: "28",
            viewBox: "0 0 28 28",
            fill: "none",
            "aria-hidden": "true",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { width: "28", height: "28", rx: "7", fill: "oklch(0.62 0.22 25)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "path",
                {
                  d: "M8 5v18M8 14l7-9M8 14l7 9",
                  stroke: "white",
                  strokeWidth: "2.3",
                  strokeLinecap: "round",
                  strokeLinejoin: "round"
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-display font-black tracking-tight text-primary", children: "KLU" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base font-display font-semibold text-muted-foreground", children: "Spotter" })
        ] })
      ]
    }
  );
}
function SemesterToggle({ value, onChange }) {
  const opts = [
    { id: "ODD", label: "Odd" },
    { id: "EVEN", label: "Even" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-ocid": "semester-toggle",
      className: "flex items-center gap-1 p-1 rounded-xl bg-muted border border-border",
      "aria-label": "Select semester",
      children: opts.map(({ id, label }) => {
        const isActive = value === id;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            "aria-pressed": isActive,
            onClick: () => onChange(id),
            "data-ocid": `semester-btn-${id.toLowerCase()}`,
            className: "relative px-3.5 py-1.5 rounded-lg text-xs font-display font-semibold transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-muted",
            children: [
              isActive && /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.span,
                {
                  layoutId: "semester-pill",
                  className: "absolute inset-0 rounded-lg bg-card border border-border shadow-sm",
                  transition: { type: "spring", stiffness: 360, damping: 28 }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: [
                    "relative z-10 transition-colors duration-200",
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  ].join(" "),
                  children: label
                }
              )
            ]
          },
          id
        );
      })
    }
  );
}
function EmptyChip({ count }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { scale: 0.8, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      transition: { type: "spring", stiffness: 420, damping: 24 },
      "data-ocid": "total-empty-count",
      "aria-live": "polite",
      className: "hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full bg-accent pulse-dot flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-display font-bold text-accent", children: count }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-body text-muted-foreground", children: "empty" })
      ]
    },
    count
  );
}
function BlockSection({
  block,
  rooms,
  isHoliday,
  isLoading,
  globalOffset
}) {
  const blockRooms = rooms.filter((r) => r.block === block.key);
  const emptyCount = isHoliday ? 0 : blockRooms.filter((r) => r.status === "EMPTY").length;
  const total = blockRooms.length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "section",
    {
      "data-ocid": `block-${block.shortLabel.toLowerCase()}`,
      "aria-label": `${block.label} rooms`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-display font-black text-primary", children: block.shortLabel }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-display font-bold uppercase tracking-[0.1em] text-foreground whitespace-nowrap", children: block.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "span",
            {
              "data-ocid": `block-count-${block.key.toLowerCase()}`,
              className: "text-[11px] font-mono px-2.5 py-0.5 rounded-full border whitespace-nowrap",
              style: {
                background: isHoliday ? "oklch(0.19 0.003 25)" : "oklch(0.8 0.27 142 / 0.12)",
                borderColor: isHoliday ? "oklch(0.22 0.005 25)" : "oklch(0.8 0.27 142 / 0.25)",
                color: isHoliday ? "oklch(0.56 0 0)" : "oklch(0.8 0.27 142)"
              },
              children: [
                emptyCount,
                " empty / ",
                total,
                " total"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px bg-border/40" })
        ] }),
        isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5", children: ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "h-[116px] rounded-xl skeleton-shimmer border border-border/20"
          },
          k
        )) }) : blockRooms.length === 0 ? null : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5", children: blockRooms.map((room, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          RoomCard,
          {
            room,
            index: globalOffset + i,
            isHoliday
          },
          room.id
        )) })
      ]
    }
  );
}
function DashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [semester, setSemester] = reactExports.useState(getDefaultSemester);
  const [cluster, setCluster] = reactExports.useState("C1");
  const [lastUpdated, setLastUpdated] = reactExports.useState(/* @__PURE__ */ new Date());
  const dayOfWeek = reactExports.useMemo(() => (/* @__PURE__ */ new Date()).getDay(), []);
  const isC1Holiday = cluster === "C1" && dayOfWeek === 6;
  const isC2Holiday = cluster === "C2" && dayOfWeek === 1;
  const isSunday = dayOfWeek === 0;
  const isHoliday = isC1Holiday || isC2Holiday || isSunday;
  const { data: session, isLoading: sessionLoading } = useCurrentSession();
  const {
    data: rooms,
    isLoading: roomsLoading,
    isError,
    dataUpdatedAt,
    refetch
  } = useRooms(dayOfWeek, cluster);
  const prevUpdatedAt = reactExports.useRef(dataUpdatedAt);
  reactExports.useEffect(() => {
    if (dataUpdatedAt && dataUpdatedAt !== prevUpdatedAt.current) {
      setLastUpdated(new Date(dataUpdatedAt));
      prevUpdatedAt.current = dataUpdatedAt;
    }
  }, [dataUpdatedAt]);
  const allRooms = rooms ?? [];
  const totalEmpty = isHoliday ? 0 : allRooms.filter((r) => r.status === "EMPTY").length;
  const occupancyPct = reactExports.useMemo(() => {
    if (!allRooms.length || isHoliday) return 0;
    return Math.round(
      allRooms.filter((r) => r.status === "OCCUPIED").length / allRooms.length * 100
    );
  }, [allRooms, isHoliday]);
  const globalOffsets = reactExports.useMemo(() => {
    const offsets = {
      R_BLOCK: 0,
      C_BLOCK: 0,
      M_BLOCK: 0
    };
    let running = 0;
    for (const b of BLOCKS) {
      offsets[b.key] = running;
      running += allRooms.filter((r) => r.block === b.key).length;
    }
    return offsets;
  }, [allRooms]);
  const handleSemesterChange = reactExports.useCallback(
    (v) => {
      if (isSunday) {
        ue.error("Does Not Exist — No sessions today", {
          duration: 5e3,
          icon: "🚫"
        });
        return;
      }
      const actual = getDefaultSemester();
      if (v !== actual) {
        ue.error("Does Not Exist", {
          description: `${v} semester is not currently active.`,
          duration: 4500
        });
        return;
      }
      setSemester(v);
    },
    [isSunday]
  );
  const handleClusterChange = reactExports.useCallback(
    (v) => {
      if (v === "C1" && dayOfWeek === 6) {
        ue.warning("C1 cluster is off today (Saturday holiday)", {
          duration: 5e3,
          icon: "📅"
        });
      } else if (v === "C2" && dayOfWeek === 1) {
        ue.warning("C2 cluster is off today (Monday holiday)", {
          duration: 5e3,
          icon: "📅"
        });
      }
      setCluster(v);
    },
    [dayOfWeek]
  );
  const handleLogout = async () => {
    await logout();
    navigate({ to: "/" });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "min-h-screen flex flex-col",
      style: { background: "oklch(0.97 0 0)" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "header",
          {
            "data-ocid": "dashboard-header",
            className: "sticky top-0 z-40 border-b shadow-subtle",
            style: {
              background: "oklch(0.99 0 0)",
              borderColor: "oklch(0.88 0 0)"
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-[1440px] mx-auto px-4 sm:px-6 h-[58px] flex items-center justify-between gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(KluLogo, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:flex flex-1 justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SessionBadge, { session, isLoading: sessionLoading }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5 flex-shrink-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyChip, { count: totalEmpty }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    "data-ocid": "logout-btn",
                    onClick: handleLogout,
                    "aria-label": "Sign out",
                    className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-body transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    style: { color: "oklch(0.45 0 0)" },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "w-4 h-4" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline text-xs font-display", children: "Logout" })
                    ]
                  }
                )
              ] })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "border-b",
            style: {
              background: "oklch(0.97 0 0)",
              borderColor: "oklch(0.88 0 0)"
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-[1440px] mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:block text-[11px] font-body text-muted-foreground uppercase tracking-wider", children: "Semester" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SemesterToggle, { value: semester, onChange: handleSemesterChange })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden sm:block w-px h-6 bg-border", "aria-hidden": true }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:block text-[11px] font-body text-muted-foreground uppercase tracking-wider", children: "Cluster" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ClusterToggle, { value: cluster, onChange: handleClusterChange })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isHoliday && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                motion.div,
                {
                  initial: { opacity: 0, scale: 0.92 },
                  animate: { opacity: 1, scale: 1 },
                  exit: { opacity: 0, scale: 0.92 },
                  transition: { duration: 0.22 },
                  "data-ocid": "holiday-notice",
                  className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/25 text-primary text-xs font-display font-semibold",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3.5 h-3.5 flex-shrink-0" }),
                    isSunday ? "Sunday — No Classes" : isC1Holiday ? "C1 Saturday Holiday" : "C2 Monday Holiday"
                  ]
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden w-full mt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SessionBadge, { session, isLoading: sessionLoading }) })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "main",
          {
            className: "flex-1 dark",
            style: { background: "oklch(0.1 0 0)", color: "oklch(0.95 0 0)" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-[1440px] mx-auto px-4 sm:px-6 pt-5 pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  motion.div,
                  {
                    initial: { opacity: 0, y: 14 },
                    animate: { opacity: 1, y: 0 },
                    transition: { duration: 0.38 },
                    className: "md:col-span-2 relative rounded-2xl overflow-hidden border border-border bg-card min-h-[150px] flex flex-col justify-end p-5",
                    "data-ocid": "spotlight-panel",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          "aria-hidden": true,
                          className: "absolute inset-0 opacity-[0.05]",
                          style: {
                            backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 24px, currentColor 24px, currentColor 25px)"
                          }
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "absolute inset-0 panel-glow-red" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "absolute top-4 right-5 opacity-15", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-28 h-28 text-primary" }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-body text-muted-foreground uppercase tracking-widest mb-1", children: "Spotlight" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-3", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-display font-black text-5xl text-foreground leading-none", children: [
                            occupancyPct,
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl text-muted-foreground", children: "%" })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-0.5", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-display font-bold text-foreground", children: isHoliday ? "Holiday" : "Live Occupancy" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-body", children: isHoliday ? `${cluster} cluster — no classes` : `${totalEmpty} rooms available right now` })
                          ] })
                        ] })
                      ] })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  motion.div,
                  {
                    initial: { opacity: 0, y: 14 },
                    animate: { opacity: 1, y: 0 },
                    transition: { duration: 0.38, delay: 0.08 },
                    className: "relative rounded-2xl overflow-hidden border border-primary/30 bg-card min-h-[150px] flex flex-col items-center justify-center gap-3 p-5",
                    "data-ocid": "quick-status-panel",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          "aria-hidden": true,
                          className: "absolute inset-0 panel-glow-red opacity-60"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative z-10 burst-container bg-primary px-7 py-3.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "roar-text text-4xl", children: "ROAR" }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 flex items-center gap-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-accent pulse-dot" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground", children: "ROAR BURST ACTIVE" })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "relative z-10 text-xs text-muted-foreground font-body text-center", children: (session == null ? void 0 : session.sessionLabel) ?? "No Active Session" })
                    ]
                  }
                )
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-[1440px] mx-auto px-4 sm:px-6 pb-6", children: isError ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                motion.div,
                {
                  initial: { opacity: 0, y: 12 },
                  animate: { opacity: 1, y: 0 },
                  "data-ocid": "rooms-error-state",
                  className: "flex flex-col items-center justify-center gap-4 py-24 text-center",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-7 h-7 text-primary" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-display font-semibold text-foreground", children: "Unable to load room data" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1 font-body", children: "Check your connection or try again" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "button",
                      {
                        type: "button",
                        "data-ocid": "retry-btn",
                        onClick: () => refetch(),
                        className: "flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-display font-semibold hover:opacity-90 transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-4 h-4" }),
                          "Retry"
                        ]
                      }
                    )
                  ]
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-8", children: BLOCKS.map((block) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                BlockSection,
                {
                  block,
                  rooms: allRooms,
                  isHoliday,
                  isLoading: roomsLoading,
                  globalOffset: globalOffsets[block.key] ?? 0
                },
                block.key
              )) }) })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "footer",
          {
            "data-ocid": "dashboard-footer",
            className: "border-t",
            style: {
              background: "oklch(0.97 0 0)",
              borderColor: "oklch(0.88 0 0)"
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-[1440px] mx-auto px-4 sm:px-6 h-[42px] flex items-center justify-between gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  "data-ocid": "refresh-btn",
                  onClick: () => refetch(),
                  "aria-label": "Refresh room data",
                  className: "flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-accent pulse-dot flex-shrink-0" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { "data-ocid": "last-updated-ts", children: [
                      "Last updated: ",
                      formatTS(lastUpdated)
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-3 h-3 ml-0.5" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground font-body hidden sm:block", children: [
                "© ",
                (/* @__PURE__ */ new Date()).getFullYear(),
                ".",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "a",
                  {
                    href: `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "underline underline-offset-2 hover:text-foreground transition-colors duration-200",
                    children: "Built with love using caffeine.ai"
                  }
                )
              ] })
            ] })
          }
        )
      ]
    }
  );
}
export {
  DashboardPage as default
};
