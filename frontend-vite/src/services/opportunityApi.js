
import axios from "axios";

const API_URL = "http://localhost:5000/api/opportunities";

export const getAllOpportunities = () => {
    return axios.get(`${API_URL}/all`);
};

export const getOpportunityById = (id) => {
    return axios.get(`${API_URL}/${id}`);
};

export const createOpportunity = (data) => {
    return axios.post(`${API_URL}/create`, data);
};

export const updateOpportunity = (id, data) => {
    return axios.put(`${API_URL}/update/${id}`, data);
};

export const deleteOpportunity = (id) => {
    return axios.delete(`${API_URL}/${id}`);
};
