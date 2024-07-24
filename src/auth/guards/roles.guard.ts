import { Role } from 'src/user/types/userRole.type';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard extends AuthGuard('jwt') implements CanActivate {
  // extends AuthGuard('jwt'): 로그인이 기본적으로 된 상황에서 가겠다는 뜻
  constructor(private reflector: Reflector) {
    super();
  }

  // canActivate: 너는 허용이 된다/안된다 판단
  async canActivate(context: ExecutionContext) {
    // 1. 인증이 된 상태인가?
    const authenticated = await super.canActivate(context);
    // 1-1. 인증이 되지 않은 상태라면 false
    if (!authenticated) {
      return false;
    }

    // 우리가 데코레이터 쓸 형식: @Roles(Role.ADMIN)
    // 우리가 비교할 메타데이터 형식: { roles: [Role.ADMIN] } (권한가진 role들을 요소로 가지는 배열)
    // 2. reflector를 사용하여 roles 키를 가진 메타데이터 읽기 [Role.ADMIN]
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    // 2-1. requireRoles가 없다 = role이 지정되지 않았다.
    // 예시> 딱히 role 제한 없이 할 수 있는 API는 role 지정을 하지 않았을 것이니까... 이런 경우
    if (!requiredRoles) {
      return true;
    }
    // 2-2. requireRoles가 있다 = role이 지정되어 있다.
    // 예시> role 제한이 있는(예를 들어 ADMIN만 할 수 있는) API를 실행하려는 경우

    // 3. 그렇다면 사용자가 권한 지정된 role이 맞는지 확인해야함
    // 3-1. 사용자 정보 가져오기
    const { user } = context.switchToHttp().getRequest();
    // 3-2. some: 여기에 해당하는 게 맞니? => 맞으면 true, 아니면 false 반환
    return requiredRoles.some((role) => user.role === role);
  }
}
