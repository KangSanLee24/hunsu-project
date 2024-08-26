```
.
├── README.md
├── artillery
│   ├── api-main.yml
│   ├── api-post.yml
│   ├── api-socketio.yml
│   ├── categorys.csv
│   ├── no-redis
│   │   └── result.json
│   ├── user.csv
│   └── users_simple.csv
├── dist
├── docs
│   ├── 5zirap_project_logo.jpg
│   ├── Installation.md
│   ├── api.md
│   ├── architecture.png
│   └── trouble-shouting.md
├── front
│   ├── config
│   │   ├── config.js
│   │   └── env.js
│   ├── html
│   │   ├── alarm.html
│   │   ├── change-password.html
│   │   ├── chat-list.html
│   │   ├── chat.html
│   │   ├── delete-profile.html
│   │   ├── email-confirmation.html
│   │   ├── index.html
│   │   ├── log-in-naver-cb.html
│   │   ├── log-in.html
│   │   ├── log-manager.html
│   │   ├── my-page.html
│   │   ├── post-create.html
│   │   ├── post-detail.html
│   │   ├── post-list.html
│   │   ├── sign-up.html
│   │   ├── update-password.html
│   │   └── update-profile.html
│   ├── images
│   │   ├── 5zirap_logo.jpg
│   │   ├── facebook_login.png
│   │   ├── google_login.png
│   │   ├── instagram_login.png
│   │   ├── kakao_login.png
│   │   ├── logo_long.png
│   │   ├── naver_login.png
│   │   ├── naver_login_long.png
│   │   └── post_write.jpg
│   ├── js
│   │   ├── admin
│   │   │   └── log-manager.js
│   │   ├── alarm
│   │   │   └── alarm.js
│   │   ├── auth
│   │   │   ├── change-password.js
│   │   │   ├── email-confirmation.js
│   │   │   ├── log-in-naver.js
│   │   │   ├── log-in.js
│   │   │   ├── sign-up.js
│   │   │   └── update-password.js
│   │   ├── chat
│   │   │   ├── chat-create.js
│   │   │   ├── chat-list.js
│   │   │   ├── chat-search.js
│   │   │   └── chat.js
│   │   ├── common
│   │   │   ├── elapsed-time.js
│   │   │   ├── header.js
│   │   │   ├── identify-user.js
│   │   │   └── level-rank.js
│   │   ├── index
│   │   │   └── index.js
│   │   ├── my-page
│   │   │   └── my-page.js
│   │   ├── post
│   │   │   ├── comment-delete.js
│   │   │   ├── comment-edit.js
│   │   │   ├── comments.js
│   │   │   ├── post-create.js
│   │   │   ├── post-detail.js
│   │   │   └── post-list.js
│   │   └── user
│   │       ├── delete-profile.js
│   │       └── update-profile.js
│   └── styles
│       ├── alarm.css
│       ├── change-password.css
│       ├── chat-list.css
│       ├── chat.css
│       ├── delete-profile.css
│       ├── email-confirmation.css
│       ├── index.css
│       ├── log-in.css
│       ├── log-manager.css
│       ├── my-page.css
│       ├── post-create.css
│       ├── post-detail.css
│       ├── post-list.css
│       ├── sign-up.css
│       ├── style.css
│       ├── update-password.css
│       └── update-profile.css
├── logs
├── nest-cli.json
├── package-lock.json
├── package.json
├── scripts
│   ├── cd-error.sh
│   └── run.sh
├── src
│   ├── alarm
│   │   ├── alarm-test.ts
│   │   ├── alarm.controller.ts
│   │   ├── alarm.module.ts
│   │   ├── alarm.service.ts
│   │   ├── dto
│   │   │   └── find-all-alarms.dto.ts
│   │   ├── entities
│   │   │   └── alarm.entity.ts
│   │   └── types
│   │       └── alarm-from.type.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── auth
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── dtos
│   │   │   ├── find-id.dto.ts
│   │   │   ├── log-in.dto.ts
│   │   │   ├── re-password.dto.ts
│   │   │   ├── sign-up.dto.ts
│   │   │   ├── update-password.dto.ts
│   │   │   ├── verify-email.dto.ts
│   │   │   └── verify-password.dto.ts
│   │   ├── entities
│   │   │   └── social-data.entity.ts
│   │   └── guards
│   │       ├── jwt.strategy.ts
│   │       ├── kakao.strategy.ts
│   │       ├── naver.guard.ts
│   │       ├── naver.strategy.ts
│   │       ├── re-token.guard.ts
│   │       └── roles.guard.ts
│   ├── aws
│   │   ├── aws.module.ts
│   │   ├── aws.service.spec.ts
│   │   └── aws.service.ts
│   ├── chat
│   │   ├── chat.controller.ts
│   │   ├── chat.module.ts
│   │   ├── chat.service.ts
│   │   ├── dto
│   │   │   └── create-chat.dto.ts
│   │   └── entities
│   │       ├── chat-image.entity.ts
│   │       ├── chat-member.entity.ts
│   │       └── chat-room.entity.ts
│   ├── comment
│   │   ├── comment.controller.ts
│   │   ├── comment.module.ts
│   │   ├── comment.service.ts
│   │   ├── dtos
│   │   │   ├── create-comment.dto.ts
│   │   │   └── update-comment.dto.ts
│   │   └── entities
│   │       ├── comment-dislike.entity.ts
│   │       ├── comment-like.entity.ts
│   │       └── comment.entity.ts
│   ├── configs
│   │   ├── database.config.ts
│   │   ├── env-validation.config.ts
│   │   └── winston.config.ts
│   ├── constants
│   │   ├── alarm-message.constant.ts
│   │   ├── auth-message.constant.ts
│   │   ├── comment-message.constant.ts
│   │   ├── point-redis.constant.ts
│   │   ├── post-message.constant.ts
│   │   └── user-message.constant.ts
│   ├── decorators
│   │   ├── count-like.decorator.ts
│   │   ├── log-in-kakao.decorator.ts
│   │   ├── log-in.decorator.ts
│   │   ├── roles.decorator.ts
│   │   └── token.decorator.ts
│   ├── events
│   │   ├── events.gateway.spec.ts
│   │   ├── events.gateway.ts
│   │   └── events.module.ts
│   ├── hashtag
│   │   ├── hashtag.controller.ts
│   │   ├── hashtag.module.ts
│   │   └── hashtag.service.ts
│   ├── http-exception.filter.ts
│   ├── log
│   │   ├── dto
│   │   │   └── get-all-logs.dto.ts
│   │   ├── entities
│   │   │   └── log.entity.ts
│   │   ├── log.controller.ts
│   │   ├── log.module.ts
│   │   ├── log.service.ts
│   │   └── types
│   │       └── log.type.ts
│   ├── mail
│   │   ├── mail.controller.ts
│   │   ├── mail.module.ts
│   │   └── mail.service.ts
│   ├── main.ts
│   ├── middlewares
│   │   └── logging.middleware.ts
│   ├── point
│   │   ├── entities
│   │   │   ├── point-log.entity.ts
│   │   │   └── point.entity.ts
│   │   ├── point.controller.ts
│   │   ├── point.module.ts
│   │   ├── point.service.ts
│   │   └── types
│   │       └── point.type.ts
│   ├── post
│   │   ├── dtos
│   │   │   ├── create-post.dto.ts
│   │   │   ├── find-all-posts.dto.ts
│   │   │   └── update-post.dto.ts
│   │   ├── entities
│   │   │   ├── post-dislike.entity.ts
│   │   │   ├── post-like.entity.ts
│   │   │   └── post.entity.ts
│   │   ├── post.controller.ts
│   │   ├── post.module.ts
│   │   ├── post.service.ts
│   │   └── types
│   │       ├── post-category.type.ts
│   │       └── post-order.type.ts
│   ├── recomment
│   │   ├── dtos
│   │   │   └── create-recomment.dto.ts
│   │   ├── entities
│   │   │   └── recomment.entity.ts
│   │   ├── recomment.controller.ts
│   │   ├── recomment.module.ts
│   │   └── recomment.service.ts
│   ├── redis
│   │   ├── redis.module.ts
│   │   ├── redis.service.ts
│   │   └── sub.redis.service.ts
│   ├── redis-io.adapter
│   │   ├── redis-io.adapter.module.ts
│   │   └── redis-io.adapter.ts
│   ├── schedule
│   │   ├── schedule.module.ts
│   │   └── schedule.service.ts
│   ├── sentry
│   │   └── sentry-webhook.intersepter.ts
│   ├── shopping
│   │   ├── shopping.controller.ts
│   │   ├── shopping.module.ts
│   │   └── shopping.service.ts
│   └── user
│       ├── dtos
│       │   ├── restore-user.dto.ts
│       │   ├── softdelete-user.dto.ts
│       │   └── update-user.dto.ts
│       ├── entities
│       │   └── user.entity.ts
│       ├── types
│       │   ├── social-type.type.ts
│       │   └── user-role.type.ts
│       ├── user.controller.ts
│       ├── user.module.ts
│       └── user.service.ts
├── test
├── tsconfig.build.json
└── tsconfig.json
```