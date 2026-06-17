type pattern = {
  regex: RegExp;
  message: string;
};

export type FieldRule = {
  required?: boolean | ((form: Record<string, string>) => boolean);
  pattern?: pattern;
};

export const EmailPattern: pattern = {
  regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  message: 'Email 格式有誤'
};

export const PasswordPattern: pattern = {
  regex: /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':",.<>/?`~]{4,}$/,
  message: '至少 4 個字符，允許英、數、特殊符號'
};

export const UsernamePattern: pattern = {
  regex: /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':",.<>/?`~]{5,}$/,
  message: '至少 5 個字符，允許英、數、特殊符號'
};
