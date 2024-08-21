import { IoAdapter } from "@nestjs/platform-socket.io";
import { ServerOptions } from 'socket.io';
import { createAdapter } from "@socket.io/redis-adapter";
import { RedisService } from "src/redis/redis.service";

export class RedisIoAdapter extends IoAdapter {
    private adapterConstructor: ReturnType<typeof createAdapter>;
                                           
	// 기존에 이미 redis를 이용하고 있기에 새로 연결이 아닌 기존의 redisService를 매개변수로 받음
    constructor(
        app: any,
        private readonly redisService: RedisService,
    ) {
        super(app);
    }

    async connectToRedis(): Promise<void> {
      	// 이미 연결되어 있는 redis 클라이언트를 받아옴
      	// pub은 메시지 발행에 사용
        const pubClient = this.redisService.getClient();
		// sub은 채널을 구독해 메시지 수신에 사용
        const subClient = pubClient.duplicate();

        this.adapterConstructor = createAdapter(pubClient, subClient);
    }

    // main.ts에서 redis 어댑터 생성시 호출됨
    createIOServer(port: number, options?: ServerOptions): any {
        const server = super.createIOServer(port, options);
        server.adapter(this.adapterConstructor);
        return server;
    }
}