import { api, client } from '@/adapter';

import store from '@/store';

const login = async (username: string, password: string): Promise <any> => {
  return api({
    url: "login", 
    method: "post",
    data: {
      'USERNAME': username, 
      'PASSWORD': password
    }
  });
}

const checkPermission = async (payload: any): Promise <any>  => {
  let baseURL = store.getters['user/getInstanceUrl'];
  baseURL = baseURL && baseURL.startsWith('http') ? baseURL : `https://${baseURL}.hotwax.io/api/`;
  return client({
    url: "checkPermission",
    method: "post",
    baseURL: baseURL,
    ...payload
  });
}

const getProfile = async (): Promise <any>  => {
    return api({
      url: "user-profile", 
      method: "get",
    });
}
const getAvailableTimeZones = async (): Promise <any>  => {
  return api({
    url: "getAvailableTimeZones",
    method: "get",
    cache: true
  });
}
const setUserTimeZone = async (payload: any): Promise <any>  => {
  return api({
    url: "setUserTimeZone",
    method: "post",
    data: payload
  });
}

const getUserPreference = async (payload: any): Promise<any> => {
  return api({
    url: "service/getUserPreference",
    method: "post",
    data: payload
  });
}
const setUserPreference = async (payload: any): Promise<any> => {
  return api({
    url: "service/setUserPreference",
    method: "post",
    data: payload
  });
}

const getEComStores = async (facilityId: string): Promise<any> => {
  try {
    const payload = {
      "inputFields": {
        "facilityId": facilityId,
      },
      "fieldList": ["defaultCurrencyUomId", "productStoreId"],
      "entityName": "ProductStoreFacilityDetail",
      "noConditionFind": "Y",
    }
    
    const resp = await api({
      url: "performFind",
      method: "post",
      data: payload
    });
    
    return resp.data.docs?.length ? resp.data.docs[0] : {};
  } catch (err) {
    console.error(err)
  }
}
const getRerouteFulfillmentConfig = async (payload: any): Promise<any> => {
  return api({
    url: "performFind",
    method: "get",
    params: payload,
  });
}

const updateRerouteFulfillmentConfig = async (payload: any): Promise<any> => {
  return api({
    url: "service/updateProductStoreSetting",
    method: "post",
    data: payload
  });
}


export const UserService = {
    login,
    getAvailableTimeZones,
    getProfile,
    getRerouteFulfillmentConfig,
    setUserTimeZone,
    getUserPreference,
    setUserPreference,
    checkPermission,
    getEComStores,
    updateRerouteFulfillmentConfig
}