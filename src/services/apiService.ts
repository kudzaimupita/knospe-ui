/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/consistent-type-imports */
//@ts-nocheck

import { User } from "../types";
import axios from "axios";

// API base URL - replace with your actual API URL
const API_URL = "http://localhost:3000/v1";

// Keys for local storage
const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user_data";

/**
 * Authentication service for handling user authentication
 * and storing credentials in local storage
 */
export const authService = {
	/**
	 * Register a new user
	 * @param email User's email
	 * @param password User's password
	 * @param name User's name (optional)
	 * @returns Promise with user data
	 */
	async register(
		email: string,
		password: string,
		name?: string
	): Promise<{ user: User; tokens: any }> {
		try {
			const response = await axios.post(`${API_URL}/auth/register`, {
				email,
				password,
				name,
			});

			// Save auth data to local storage
			this.setTokens(response.data.tokens);
			this.setUser(response.data.user);

			return response.data;
		} catch (error) {
			console.error("Registration failed:", error);
			throw error;
		}
	},

	/**
	 * Login a user
	 * @param email User's email
	 * @param password User's password
	 * @returns Promise with user data
	 */
	async login(
		email: string,
		password: string
	): Promise<{ user: User; tokens: any }> {
		try {
			const response = await axios.post(`${API_URL}/auth/login`, {
				email,
				password,
			});

			// Save auth data to local storage
			this.setTokens(response.data.tokens);
			this.setUser(response.data.user);

			return response.data;
		} catch (error) {
			console.error("Login failed:", error);
			throw error;
		}
	},

	/**
	 * Logout the current user
	 */
	logout(): void {
		localStorage.removeItem(TOKEN_KEY);
		localStorage.removeItem(REFRESH_TOKEN_KEY);
		localStorage.removeItem(USER_KEY);
	},

	/**
	 * Store authentication tokens in local storage
	 * @param tokens Object containing access and refresh tokens
	 */
	setTokens(tokens: {
		access: { token: string };
		refresh: { token: string };
	}): void {
		localStorage.setItem(TOKEN_KEY, tokens.access.token);
		localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh.token);
	},

	/**
	 * Store user data in local storage
	 * @param user User object
	 */
	setUser(user: User): void {
		localStorage.setItem(USER_KEY, JSON.stringify(user));
	},

	/**
	 * Get the current authentication token
	 * @returns The authentication token or null if not logged in
	 */
	getToken(): string | null {
		return localStorage.getItem(TOKEN_KEY);
	},

	/**
	 * Get the refresh token
	 * @returns The refresh token or null if not logged in
	 */
	getRefreshToken(): string | null {
		return localStorage.getItem(REFRESH_TOKEN_KEY);
	},

	/**
	 * Get the current user data
	 * @returns User object or null if not logged in
	 */
	getUser(): User | null {
		const userData = localStorage.getItem(USER_KEY);
		return userData ? JSON.parse(userData) : null;
	},

	/**
	 * Check if user is authenticated
	 * @returns Boolean indicating if user is logged in
	 */
	isAuthenticated(): boolean {
		return !!this.getToken();
	},

	/**
	 * Refresh the access token using the refresh token
	 * @returns Promise with new tokens
	 */
	async refreshToken(): Promise<{ tokens: any }> {
		try {
			const refreshToken = this.getRefreshToken();

			if (!refreshToken) {
				throw new Error("No refresh token available");
			}

			const response = await axios.post(`${API_URL}/auth/refresh-tokens`, {
				refreshToken,
			});

			// Update stored tokens
			this.setTokens(response.data.tokens);

			return response.data;
		} catch (error) {
			console.error("Token refresh failed:", error);
			// Force logout on refresh token failure
			this.logout();
			throw error;
		}
	},

	/**
	 * Query patients with optional filtering and pagination
	 * @param filter Filtering criteria
	 * @param options Pagination and sorting options
	 * @returns Promise with patients data
	 */
	async queryPatients(
		filter = {},
		options = {}
	): Promise<{ patients: any[]; total: number; page: number; limit: number }> {
		try {
			// Add auth token to request
			// const token = this.getToken();
			const token =
				"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImlhdCI6MTc0NTIzNzIwOCwiZXhwIjoxNzQ1MjM5MDA4LCJ0eXBlIjoiQUNDRVNTIn0.jjiopeSR2l_dCKPpn92xF8KyB92hN-Je0x9XU-3SHN8";
			if (!token) {
				throw new Error("Authentication required");
			}

			const response = await axios.get(`${API_URL}/patients`, {
				params: { ...filter, ...options },
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			console.log(response);
			return response.data;
		} catch (error) {
			console.error("Failed to query patients:", error);
			throw error;
		}
	},
};

// Create axios interceptor to handle token expiration
axios.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		// If error is 401 and we haven't already tried to refresh the token
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				// Try to refresh the token
				await authService.refreshToken();

				// Update the token in the request
				originalRequest.headers.Authorization = `Bearer ${authService.getToken()}`;

				// Retry the request
				return axios(originalRequest);
			} catch (refreshError) {
				// If token refresh fails, redirect to login
				authService.logout();
				return Promise.reject(refreshError);
			}
		}

		return Promise.reject(error);
	}
);

export default authService;
