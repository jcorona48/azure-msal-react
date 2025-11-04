import { ApiService } from "./api.service";

export class UserService extends ApiService {
    constructor(token: string) {
        super({
            token: token,
            version: "1.0",
            scope: "me",
        });
    }

    public async getUserDetails() {
        return await this.get("/");
    }

    public async getUserPhoto(userName: string = "me"): Promise<string | null> {
        try {
            const blob = await this.get<Blob>("/photo/$value", undefined, {
                responseType: "blob",
            });
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error("Error fetching user photo:", error);
            return `https://ui-avatars.com/api/?rounded=true&name=${encodeURIComponent(
                userName
            )}`;
        }
    }
}
