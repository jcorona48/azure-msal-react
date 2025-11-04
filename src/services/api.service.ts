export interface ApiServiceOptions {
    baseURL?: string;
    version?: string;
    scope?: string;
    headers?: Record<string, string>;
    token?: string;
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
        config?: { blobResponse: boolean }
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
            if (config?.blobResponse) {
                return (await response.blob()) as unknown as T;
            }
            return (await response.json()) as T;
        } catch {
            return {} as T;
        }
    }

    protected get<T>(
        path: string,
        headers?: Record<string, string>,
        config?: { blobResponse: boolean }
    ): Promise<T> {
        return this.request<T>("GET", path, undefined, headers, config);
    }

    protected post<T, Data = unknown>(
        path: string,
        data?: Data,
        headers?: Record<string, string>
    ): Promise<T> {
        return this.request<T>("POST", path, data, headers);
    }

    protected put<T, Data>(
        path: string,
        data?: Data,
        headers?: Record<string, string>
    ): Promise<T> {
        return this.request<T>("PUT", path, data, headers);
    }

    protected patch<T, Data>(
        path: string,
        data?: Data,
        headers?: Record<string, string>
    ): Promise<T> {
        return this.request<T>("PATCH", path, data, headers);
    }

    protected delete<T>(
        path: string,
        headers?: Record<string, string>
    ): Promise<T> {
        return this.request<T>("DELETE", path, undefined, headers);
    }
}
