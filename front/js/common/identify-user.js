/** accessToken으로 로그인 유저 정보 조회 API **/
export const fetchAccessToken = async (accessToken) => {
  const response = await fetch(`/api/users/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    return null;
  }
};

/** refreshToken으로 accessToken 재발급 API **/
export const fetchRefreshToken = async (refreshToken) => {
  const response = await fetch(`/api/auth/re-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${refreshToken}`,
    },
  });
  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    return null;
  }
}