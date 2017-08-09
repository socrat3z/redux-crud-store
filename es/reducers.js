'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.modelInitialState = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); /* eslint no-case-declarations: 0 */

exports.byIdReducer = byIdReducer;
exports.collectionReducer = collectionReducer;
exports.collectionsReducer = collectionsReducer;
exports.actionStatusReducer = actionStatusReducer;
exports.default = crudReducer;

var _immutable = require('immutable');

var _lodash = require('lodash.isequal');

var _lodash2 = _interopRequireDefault(_lodash);

var _devMessage = require('./devMessage');

var _devMessage2 = _interopRequireDefault(_devMessage);

var _actionTypes = require('./actionTypes');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * SECTION: initial states
 */

var byIdInitialState = (0, _immutable.fromJS)({});

var collectionInitialState = (0, _immutable.fromJS)({
  params: {},
  otherInfo: {},
  ids: [],
  fetchTime: null,
  error: null
});

var collectionsInitialState = (0, _immutable.fromJS)([]);

var actionStatusInitialState = (0, _immutable.fromJS)({
  create: {},
  update: {},
  delete: {}
});

var modelInitialState = exports.modelInitialState = (0, _immutable.fromJS)({
  byId: byIdInitialState,
  collections: collectionsInitialState,
  actionStatus: actionStatusInitialState
});

// holds a number of models, each of which are strucured like modelInitialState
var initialState = (0, _immutable.fromJS)({});

/*
 * SECTION: reducers
 */

// server data is canonical, so blast away the old data
function byIdReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : byIdInitialState;
  var action = arguments[1];

  var id = action.meta ? action.meta.id : undefined;
  switch (action.type) {
    case _actionTypes.FETCH_SUCCESS:
      var data = state.toJS();
      var payload = 'data' in action.payload ? action.payload.data : action.payload;
      payload.forEach(function (record) {
        data[record.id] = {
          record: record,
          fetchTime: action.meta.fetchTime,
          error: null
        };
      });
      return (0, _immutable.fromJS)(data);
    case _actionTypes.FETCH_ONE:
      return state.setIn([id.toString(), 'fetchTime'], 0).setIn([id.toString(), 'error'], null).setIn([id.toString(), 'record'], null);
    case _actionTypes.FETCH_ONE_SUCCESS:
      return state.setIn([id.toString(), 'fetchTime'], action.meta.fetchTime).setIn([id.toString(), 'error'], null).setIn([id.toString(), 'record'], (0, _immutable.fromJS)(action.payload));
    case _actionTypes.FETCH_ONE_ERROR:
      return state.setIn([id.toString(), 'fetchTime'], action.meta.fetchTime).setIn([id.toString(), 'error'], action.payload).setIn([id.toString(), 'record'], null);
    case _actionTypes.CREATE_SUCCESS:
      var cid = action.payload.id;
      return state.set(action.payload.id.toString(), (0, _immutable.fromJS)({
        record: action.payload,
        fetchTime: action.meta.fetchTime,
        error: null
      }));
    case _actionTypes.UPDATE:
      return state.setIn([id.toString(), 'fetchTime'], 0);
    case _actionTypes.UPDATE_SUCCESS:
      return state.set(id.toString(), (0, _immutable.fromJS)({
        record: action.payload,
        fetchTime: action.meta.fetchTime,
        error: null
      }));
    case _actionTypes.DELETE_SUCCESS:
      return state.delete(id.toString());
    case _actionTypes.GARBAGE_COLLECT:
      var tenMinutesAgo = action.meta.now - 10 * 60 * 1000;
      return state.filter(function (record, _id) {
        return record.get('fetchTime') > tenMinutesAgo;
      });
    default:
      return state;
  }
}

/*
 * Note: fetchTime of null means "needs fetch"
 */
function collectionReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : collectionInitialState;
  var action = arguments[1];

  switch (action.type) {
    case _actionTypes.FETCH:
      return state.set('params', (0, _immutable.fromJS)(action.meta.params)).set('fetchTime', 0).set('error', null);
    case _actionTypes.FETCH_SUCCESS:
      var originalPayload = action.payload || {};
      var payload = 'data' in originalPayload ? originalPayload.data : originalPayload;
      var otherInfo = 'data' in originalPayload ? originalPayload : {};
      if (!Array.isArray(payload)) {
        (0, _devMessage2.default)('\n          Payload is not an array! Your server response for a FETCH action\n          should be in one of the following forms:\n\n          { data: [ ... ] }\n\n          or\n\n          [ ... ]\n        \n          Here are the contents of your action:');
        (0, _devMessage2.default)(JSON.stringify(action));
      }
      var ids = payload.map(function (elt) {
        return elt.id;
      });
      return state.set('params', (0, _immutable.fromJS)(action.meta.params)).set('ids', (0, _immutable.fromJS)(ids)).set('otherInfo', (0, _immutable.fromJS)(otherInfo).delete('data')).set('error', null).set('fetchTime', action.meta.fetchTime);
    case _actionTypes.FETCH_ERROR:
      return state.set('params', (0, _immutable.fromJS)(action.meta.params)).set('error', action.payload);
    default:
      return state;
  }
}

/* eslint-disable no-shadow, no-use-before-define */
function collectionsReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : collectionsInitialState;
  var action = arguments[1];

  var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref$collectionReduce = _ref.collectionReducer,
      collectionReducer = _ref$collectionReduce === undefined ? collectionReducer : _ref$collectionReduce;

  /* eslint-enable no-shadow, no-use-before-define */
  switch (action.type) {
    case _actionTypes.FETCH:
    case _actionTypes.FETCH_SUCCESS:
    case _actionTypes.FETCH_ERROR:
      // create the collection for the given params if needed
      // entry will be undefined or [index, existingCollection]
      if (action.meta.params === undefined) {
        return state;
      }
      var entry = state.findEntry(function (coll) {
        return (0, _lodash2.default)(coll.toJS().params, action.meta.params);
      });
      if (entry === undefined) {
        return state.push(collectionReducer(undefined, action));
      }

      var _entry = _slicedToArray(entry, 2),
          index = _entry[0],
          existingCollection = _entry[1];

      return state.update(index, function (s) {
        return collectionReducer(s, action);
      });
    case _actionTypes.CREATE_SUCCESS:
    case _actionTypes.DELETE_SUCCESS:
      // set fetchTime on all entries to null
      return state.map(function (item, idx) {
        return item.set('fetchTime', null);
      });

    case _actionTypes.GARBAGE_COLLECT:
      var tenMinutesAgo = action.meta.now - 10 * 60 * 1000;
      return state.filter(function (collection) {
        return collection.get('fetchTime') > tenMinutesAgo || collection.get('fetchTime') === null;
      });
    default:
      return state;
  }
}

function actionStatusReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : actionStatusInitialState;
  var action = arguments[1];

  switch (action.type) {
    case _actionTypes.CLEAR_ACTION_STATUS:
      return state.set(action.payload.action, (0, _immutable.fromJS)({}));
    case _actionTypes.CREATE:
      return state.set('create', (0, _immutable.fromJS)({
        pending: true,
        id: null
      }));
    case _actionTypes.CREATE_SUCCESS:
    case _actionTypes.CREATE_ERROR:
      return state.set('create', (0, _immutable.fromJS)({
        pending: false,
        id: action.payload.id,
        isSuccess: !action.error,
        payload: action.payload
      }));
    case _actionTypes.UPDATE:
      return state.set('update', (0, _immutable.fromJS)({
        pending: true,
        id: action.meta.id
      }));
    case _actionTypes.UPDATE_SUCCESS:
    case _actionTypes.UPDATE_ERROR:
      return state.set('update', (0, _immutable.fromJS)({
        pending: false,
        id: action.meta.id,
        isSuccess: !action.error,
        payload: action.payload
      }));
    case _actionTypes.DELETE:
      return state.set('delete', (0, _immutable.fromJS)({
        pending: true,
        id: action.meta.id
      }));
    case _actionTypes.DELETE_SUCCESS:
    case _actionTypes.DELETE_ERROR:
      return state.set('delete', (0, _immutable.fromJS)({
        pending: false,
        id: action.meta.id,
        isSuccess: !action.error,
        payload: action.payload // probably null...
      }));
    default:
      return state;
  }
}

/* eslint-disable no-shadow, no-use-before-define */
function crudReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments[1];

  var _ref2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref2$actionStatusRed = _ref2.actionStatusReducer,
      actionStatusReducer = _ref2$actionStatusRed === undefined ? actionStatusReducer : _ref2$actionStatusRed,
      _ref2$byIdReducer = _ref2.byIdReducer,
      byIdReducer = _ref2$byIdReducer === undefined ? byIdReducer : _ref2$byIdReducer,
      _ref2$collectionsRedu = _ref2.collectionsReducer,
      collectionsReducer = _ref2$collectionsRedu === undefined ? collectionsReducer : _ref2$collectionsRedu;

  /* eslint-enable no-shadow, no-use-before-define */
  var id = action.meta ? action.meta.id : undefined;
  switch (action.type) {
    case _actionTypes.CLEAR_MODEL_DATA:
      return state.set(action.payload.model, modelInitialState);
    case _actionTypes.CLEAR_ACTION_STATUS:
      return state.updateIn([action.payload.model, 'actionStatus'], function (s) {
        return actionStatusReducer(s, action);
      });
    case _actionTypes.GARBAGE_COLLECT:
      return state.map(function (model) {
        return model.update('collections', function (s) {
          return collectionsReducer(s, action);
        }).update('byId', function (s) {
          return byIdReducer(s, action);
        });
      });
    case _actionTypes.FETCH:
    case _actionTypes.FETCH_SUCCESS:
    case _actionTypes.FETCH_ERROR:
      return state.updateIn([action.meta.model, 'collections'], function (s) {
        return collectionsReducer(s, action);
      }).updateIn([action.meta.model, 'byId'], function (s) {
        return byIdReducer(s, action);
      });
    case _actionTypes.FETCH_ONE:
    case _actionTypes.FETCH_ONE_SUCCESS:
    case _actionTypes.FETCH_ONE_ERROR:
      return state.updateIn([action.meta.model, 'byId'], function (s) {
        return byIdReducer(s, action);
      });
    case _actionTypes.CREATE:
      return state.updateIn([action.meta.model, 'actionStatus'], function (s) {
        return actionStatusReducer(s, action);
      });
    case _actionTypes.CREATE_SUCCESS:
      return state.updateIn([action.meta.model, 'byId'], function (s) {
        return byIdReducer(s, action);
      }).updateIn([action.meta.model, 'collections'], (0, _immutable.fromJS)([]), function (s) {
        return collectionsReducer(s, action);
      }).updateIn([action.meta.model, 'actionStatus'], function (s) {
        return actionStatusReducer(s, action);
      });
    case _actionTypes.CREATE_ERROR:
      return state.updateIn([action.meta.model, 'actionStatus'], function (s) {
        return actionStatusReducer(s, action);
      });
    case _actionTypes.UPDATE:
    case _actionTypes.UPDATE_SUCCESS:
    case _actionTypes.UPDATE_ERROR:
      return state.updateIn([action.meta.model, 'byId'], function (s) {
        return byIdReducer(s, action);
      }).updateIn([action.meta.model, 'actionStatus'], function (s) {
        return actionStatusReducer(s, action);
      });
    case _actionTypes.DELETE:
    case _actionTypes.DELETE_SUCCESS:
    case _actionTypes.DELETE_ERROR:
      return state.updateIn([action.meta.model, 'byId'], function (s) {
        return byIdReducer(s, action);
      }).updateIn([action.meta.model, 'collections'], (0, _immutable.fromJS)([]), function (s) {
        return collectionsReducer(s, action);
      }).updateIn([action.meta.model, 'actionStatus'], function (s) {
        return actionStatusReducer(s, action);
      });
    default:
      return state;
  }
}