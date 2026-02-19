import { Role } from "./Common";

/** 인증 제공자 정보 */
export interface AuthProvider {
  /** 인증 제공자 ('local' | 'naver' | 'kakao' | 'google') */
  provider: string;
  /** 연결 일시 */
  createdAt: Date;
}

/**
 * 사용자 정보 클래스
 *
 * @remarks
 * 백엔드 User 엔티티와 매핑되는 클라이언트 모델
 */
export class User {
  /** 사용자 고유 ID */
  id: number;
  /** 로그인 아이디 (소셜 로그인 전용 사용자는 null) */
  username?: string | null;
  /** 비밀번호 (응답에서는 제외됨) */
  pw?: string;
  /** 닉네임 */
  nick: string;
  /** 이메일 주소 */
  email?: string;
  /** 이메일 인증 일시 */
  emailVerifiedAt?: Date;
  /** 전화번호 */
  phone?: string;
  /** 주소 */
  address?: string;
  /** 사용자 권한 */
  role?: Role;
  /** 프로필 이미지 URL */
  profileImageUrl?: string;
  /** 프로필 이미지 수정 일시 */
  profileImageUpdatedAt?: Date;
  /** 계정 생성 일시 */
  createdAt?: Date;
  /** 계정 수정 일시 */
  updatedAt?: Date;
  /** 계정 삭제 일시 */
  deletedAt?: Date;
  /** 연결된 인증 제공자 목록 */
  authProviders?: AuthProvider[];

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
    deletedAt?: Date,
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
    this.deletedAt = deletedAt;
    this.authProviders = authProviders; // ✅ 추가
  }

  /**
   * Record 객체에서 User 인스턴스를 생성한다.
   *
   * @param map - 변환할 객체 (백엔드 API 응답)
   */
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
      map.deletedAt
        ? typeof map.deletedAt === "string"
          ? new Date(map.deletedAt)
          : map.deletedAt
        : undefined,
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

  /** User 인스턴스를 Record 객체로 변환한다. */
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
      deletedAt: this.deletedAt,
      authProviders: this.authProviders, // ✅ 추가
    };
  }

  /**
   * JSON 문자열에서 User 인스턴스를 생성한다.
   *
   * @param json - 변환할 JSON 문자열
   */
  static fromJson(json: string): User {
    return User.fromMap(JSON.parse(json));
  }

  /** User 인스턴스를 JSON 문자열로 변환한다. */
  toJson(): string {
    return JSON.stringify(this.toMap());
  }
}
