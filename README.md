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
| ```/v1/users``` | [POST](#create-a-user) | yes |
| ```/v1/user/{ userId }``` | [GET](#get-user-info), [POST](#update-user-info) | yes |

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
    "id": "17d771f6-9471-44fa-878b-fc6b31cac48a"
    "bots": [
        {
            id: "09e0da8f-6335-4f7f-8202-6ac76a7ec3d0"
        },
        {
            id: "aa3de8a5-9237-4911-b133-a88036032ed5"
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
    "id": "0263dfd3-5cf7-4575-acce-5b30edf2784c",
    "customerId": "17d771f6-9471-44fa-878b-fc6b31cac48a",
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

### Users

An user is a recipient that a [bot](#bot) can chat to. Examples: a messenger
user, a chat group, an IRC channel…

#### Create a user

##### Request
POST ```/v1/users```

##### Parameters

- ```botId```

#### Get user info

GET ```/v1/user/{ userId }```

#### Update user info

POST ```/v1/user/{ userId }```



[facebooklogin]: https://developers.facebook.com/docs/facebook-login/web
