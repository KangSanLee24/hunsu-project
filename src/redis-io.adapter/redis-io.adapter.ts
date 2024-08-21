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
        try {
            // 이미 연결되어 있는 redis 클라이언트를 받아옴
            const pubClient = this.redisService.getClient();

            if (!pubClient) {
                throw new Error('Failed to get Redis client.');
            }

            // sub은 채널을 구독해 메시지 수신에 사용
            const subClient = pubClient.duplicate();
            this.adapterConstructor = createAdapter(pubClient, subClient);
        } catch (error) {
            console.error('Error connecting to Redis:', error);
            throw error; // 에러가 발생하면 다시 던져 호출자가 처리하게 함
        }
    }

    // main.ts에서 redis 어댑터 생성시 호출됨
    createIOServer(port: number, options?: ServerOptions): any {
        const server = super.createIOServer(port, options);
        if (this.adapterConstructor) {
            server.adapter(this.adapterConstructor);
        } else {
            console.error('Adapter constructor is not initialized.');
        }
        return server;
    }
}