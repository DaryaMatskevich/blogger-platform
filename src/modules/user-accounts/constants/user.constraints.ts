// constants/user.constraints.ts
export const loginConstraints = {
  minLength: 3,
  maxLength: 10,
};

export const passwordConstraints = {
  minLength: 6,
  maxLength: 20,
};

export const emailConstraints = {
  match: /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/,
};
