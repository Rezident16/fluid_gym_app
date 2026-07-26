export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export class UserModel {
  private data: User;

  constructor(data: User) {
    this.data = data;
  }

  get id() {
    return this.data.id;
  }

  get email() {
    return this.data.email;
  }

  get passwordHash() {
    return this.data.passwordHash;
  }

  get createdAt() {
    return this.data.createdAt;
  }

  setEmail(email: string) {
    this.data.email = email;
    return this;
  }

  setPasswordHash(passwordHash: string) {
    this.data.passwordHash = passwordHash;
    return this;
  }

  toJSON(): User {
    return { ...this.data };
  }
}
