import { IsActive, Role } from "./Common";

// AuthProvider 타입 정의 (선택적)
export interface AuthProvider {
  provider: string; // 'local' | 'naver' | 'kakao' | 'google'
  createdAt: Date;
}

export class User {
  id: number;
  username?: string | null; // ✅ nullable로 변경
  pw?: string;
  nick: string;
  email?: string;
  emailVerifiedAt?: Date;
  phone?: string;
  address?: string;
  role?: Role;
  profileImageUrl?: string;
  profileImageUpdatedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: IsActive;
  authProviders?: AuthProvider[]; // ✅ 추가

  constructor(
    id: number,
    nick: string,
    username?: string | null, // ✅ nullable로 변경, 순서 조정
    pw?: string,
    email?: string,
    emailVerifiedAt?: Date,
    phone?: string,
    address?: string,
    role?: Role,
    profileImageUrl?: string,
    profileImageUpdatedAt?: Date,
    createdAt?: Date,
    updatedAt?: Date,
    isActive?: IsActive,
    authProviders?: AuthProvider[] // ✅ 추가
  ) {
    this.id = id;
    this.username = username; // ✅ nullable
    this.pw = pw;
    this.nick = nick;
    this.email = email;
    this.emailVerifiedAt = emailVerifiedAt;
    this.phone = phone;
    this.address = address;
    this.role = role;
    this.profileImageUrl = profileImageUrl;
    this.profileImageUpdatedAt = profileImageUpdatedAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.isActive = isActive;
    this.authProviders = authProviders; // ✅ 추가
  }

  static fromMap(map: Record<string, any>): User {
    return new User(
      map.id,
      map.nick,
      map.username ?? null, // ✅ nullable 처리
      map.pw ?? undefined,
      map.email ?? undefined,
      map.emailVerifiedAt
        ? typeof map.emailVerifiedAt === "string"
          ? new Date(map.emailVerifiedAt)
          : map.emailVerifiedAt
        : undefined,
      map.phone ?? undefined,
      map.address ?? undefined,
      map.role ?? undefined,
      map.profileImageUrl ?? undefined,
      map.profileImageUpdatedAt
        ? typeof map.profileImageUpdatedAt === "string"
          ? new Date(map.profileImageUpdatedAt)
          : map.profileImageUpdatedAt
        : undefined,
      map.createdAt
        ? typeof map.createdAt === "string"
          ? new Date(map.createdAt)
          : map.createdAt
        : undefined,
      map.updatedAt
        ? typeof map.updatedAt === "string"
          ? new Date(map.updatedAt)
          : map.updatedAt
        : undefined,
      map.isActive ?? undefined,
      // ✅ authProviders 추가
      map.authProviders
        ? map.authProviders.map((ap: any) => ({
            provider: ap.provider,
            createdAt:
              typeof ap.createdAt === "string"
                ? new Date(ap.createdAt)
                : ap.createdAt,
          }))
        : undefined
    );
  }

  toMap(): Record<string, any> {
    return {
      id: this.id,
      username: this.username, // ✅ nullable
      pw: this.pw,
      nick: this.nick,
      email: this.email,
      emailVerifiedAt: this.emailVerifiedAt,
      phone: this.phone,
      address: this.address,
      role: this.role,
      profileImageUrl: this.profileImageUrl,
      profileImageUpdatedAt: this.profileImageUpdatedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive,
      authProviders: this.authProviders, // ✅ 추가
    };
  }

  // JSON 문자열을 User 객체로 변환
  static fromJson(json: string): User {
    return User.fromMap(JSON.parse(json));
  }

  // User 객체를 JSON 문자열로 변환
  toJson(): string {
    return JSON.stringify(this.toMap());
  }
}
