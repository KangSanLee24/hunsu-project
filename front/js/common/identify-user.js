// 로그인 유저 정보 조회 API
export const identifyUser = async (accessToken) => {
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
