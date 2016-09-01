# Control Tower API

A REST API to be used with https://github.com/calamar-io/controltower

This API is **extremely experimental** and will have constant breaking changes. Consider yourself warned.

This document is a **draft**!

## Endpoints

| endpoint | methods | requires authentication |
|----------|------|---------|
| ```/v1/customers``` | [POST](#create-a-customer) | no |
| ```/v1/customer/{ customerId }``` | [GET](#get-customer-info) | yes |
| ```/v1/bots``` | [POST](#create-a-bot) | yes |
| ```/v1/bot/{ botId }``` | [GET](#get-bot-config), [POST](#update-bot-config) | yes |
| ```/v1/chats``` | [POST](#create-a-chat) | yes |
| ```/v1/chat/{ chatId }``` | GET, POST | yes |

---

### Customers

The customers of the system.
Example: a paying customer that has access to an
administrative interface where she can setup programs ([bots](#bots))
that interact ([chat](#chats)) with her customers ([users](#users)).

#### Create a customer

Used by the Sign Up feature.

##### Request
POST ```/v1/customers```

##### Parameters

- ```accessToken``` a Facebook accessToken.
This can be obtained with a [Facebook Login Popup][facebooklogin]

#### Get customer info
##### Request
GET ```/v1/customer/{ customerId }```

##### Response
- 200
```
{
    "bots": [
        {
            id: "fdf988fc-a8b1-495c-997b-3c52c976d0a4"
        },
        {
            id: "a2d13204-6835-4a47-b55a-4ef84a3fc52b"
        }
    ],
    "facebook": {
        "name": "Charles McGill",
        "id": "101...36"
    }
}
```

### Bots

Programs configured by system [customers](customers), that can listen/reply to [users](#users) on chat platforms.

#### Create a bot
##### Request
POST ```/v1/bots```

##### Parameters

- ```customerId``` the id of the customer

#### Get bot config
##### Request
POST ```/v1/bot/{ botId }```
##### Response
- 200

```
{
    "id": "876548765",
    "facebook": {
        "pages": [
            {
                "id": "721...18",
                "accessToken": "EAA...ZD"
            }
        ],
        "app": {
            secret: "681e...70"
        }
    },
    "vtex": {
        "api": {
            "token": "ANX...MM",
            "key": "vtex...SU",
            "accountName": "foo",
            "environment": "vtex...com.br"
        }
        "app": {
            "key": "your.email@example.com",
            "token": "F...91"
        }
    }
}
```

#### Update bot config

##### Request
POST ```/v1/bot/{ botId }```

### Chats
(I am not happy with this name, we might revisit this in next versions)

Conversations between a [bot](#bot) and a
[recipient](#users) (user/group/channel).
One same bot can have properties with different values on different
chats. For example: A bot Bob can be active for user Alice in a Bob-Alice chat
while muted for user Charlie in a Bob-Charlie chat.

#### Create a chat

##### Request
POST ```/v1/chats```

##### Parameters

- ```botId```
- ```recipientId```


[facebooklogin]: https://developers.facebook.com/docs/facebook-login/web
