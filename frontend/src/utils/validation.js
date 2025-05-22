export function validatePassword(password) {
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=[\]{};':"\\|,.<>/?]).{8,}$/;
  return regex.test(password);
}

//--------------------------------------------------------------------------

export function validateMatchingPasswords(password, confirmPassword) {
  return password === confirmPassword;
}

//--------------------------------------------------------------------------
