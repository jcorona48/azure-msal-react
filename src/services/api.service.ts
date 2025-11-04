export interface ApiServiceOptions {
    baseURL?: string;
    version?: string;
    scope?: string;
    headers?: Record<string, string>;
    token?: string;
}

export type ResponseType =
    | "json"
    | "blob"
    | "text"
    | "arrayBuffer"
    | "formData"
    | "bytes";

export interface RequestConfig {
    responseType?: ResponseType;
}

export class ApiService {
    protected baseURL: string =
        import.meta.env.VITE_API_URL || "https://graph.microsoft.com";
    protected version?: string;
    protected scope?: string;
    protected headers: Record<string, string>;
    protected token: string | null = null;

    constructor(options: ApiServiceOptions) {
        this.version = options.version;
        this.scope = options.scope;
        this.token = options.token || null;
        this.headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.token}`,
            ...(options.headers || {}),
        };
        this.baseURL = `${options.baseURL || this.baseURL}${
            options.version ? `/v${options.version}` : ""
        }`;
    }

    protected buildUrl(path: string): string {
        const scopePath = this.scope ? `/${this.scope}` : "";
        return `${this.baseURL}${scopePath}${path}`;
    }

    protected async request<T>(
        method: string,
        path: string,
        body?: unknown,
        customHeaders?: Record<string, string>,
        config: RequestConfig = {
            responseType: "json",
        }
    ): Promise<T> {
        const url = this.buildUrl(path);
        const headers = { ...this.headers, ...(customHeaders || {}) };

        const options: RequestInit = {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        };

        const response = await fetch(url, options);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error [${response.status}]: ${errorText}`);
        }

        try {
            return await this.parseResponse<T>(
                response,
                config.responseType || "json"
            );
        } catch {
            return {} as T;
        }
    }

    protected parseResponse<T>(
        response: Response,
        responseType: ResponseType
    ): Promise<T> {
        switch (responseType) {
            case "blob":
                return response.blob() as unknown as Promise<T>;
            case "text":
                return response.text() as unknown as Promise<T>;
            case "arrayBuffer":
                return response.arrayBuffer() as unknown as Promise<T>;
            case "formData":
                return response.formData() as unknown as Promise<T>;
            case "bytes":
                return response.bytes() as unknown as Promise<T>;
            case "json":
            default:
                return response.json() as Promise<T>;
        }
    }

    protected get<T>(
        path: string,
        headers?: Record<string, string>,
        config?: RequestConfig
    ): Promise<T> {
        return this.request<T>("GET", path, undefined, headers, config);
    }

    protected post<T, Data = unknown>(
        path: string,
        data?: Data,
        headers?: Record<string, string>,
        config?: RequestConfig
    ): Promise<T> {
        return this.request<T>("POST", path, data, headers, config);
    }

    protected put<T, Data>(
        path: string,
        data?: Data,
        headers?: Record<string, string>,
        config?: RequestConfig
    ): Promise<T> {
        return this.request<T>("PUT", path, data, headers, config);
    }

    protected patch<T, Data>(
        path: string,
        data?: Data,
        headers?: Record<string, string>,
        config?: RequestConfig
    ): Promise<T> {
        return this.request<T>("PATCH", path, data, headers, config);
    }

    protected delete<T>(
        path: string,
        headers?: Record<string, string>,
        config?: RequestConfig
    ): Promise<T> {
        return this.request<T>("DELETE", path, undefined, headers, config);
    }
}
