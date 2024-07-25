import { Role } from 'src/user/types/userRole.type';

import { SetMetadata } from '@nestjs/common';

// Roles 데코레이터가 여러 role들을 받을 수 있게 배열로!
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
// roles라는 key에 받아온 roles 배열을 value로 저장 (Map 처럼)
