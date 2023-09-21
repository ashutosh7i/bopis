import { MutationTree } from 'vuex'
import UserState from './UserState'
import * as types from './mutation-types'

const mutations: MutationTree <UserState> = {
    [types.USER_TOKEN_CHANGED] (state, payload) {
        state.token = payload.newToken
    },
    [types.USER_END_SESSION] (state) {
      state.token = ''
      state.current = {}
      state.currentFacility = {}
      state.permissions = []
    },
    [types.USER_INFO_UPDATED] (state, payload) {
        state.current = payload
    },
    [types.USER_CURRENT_FACILITY_UPDATED] (state, payload) {
        state.currentFacility = payload;
    },
    [types.USER_INSTANCE_URL_UPDATED] (state, payload) {
        state.instanceUrl = payload;
    },
    [types.USER_PREFERENCE_UPDATED] (state, payload) {
        state.preference = {...state.preference, ...payload};
    },
    [types.USER_LOCALE_UPDATED] (state, payload) {
        state.locale = payload;
    },
    [types.USER_CURRENT_ECOM_STORE_UPDATED] (state, payload) {
        state.currentEComStore = payload
    },
    [types.USER_PERMISSIONS_UPDATED] (state, payload) {
        state.permissions = payload
    },
    [types.USER_PARTIAL_ORDER_REJECTION_CONFIG_UPDATED] (state, payload) {
        state.partialOrderRejectionConfig = payload
    }
    
}
export default mutations;