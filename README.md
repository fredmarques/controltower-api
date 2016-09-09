# Control Tower API

A REST API to be used with https://github.com/calamar-io/controltower

This API is **extremely experimental** and will have constant breaking changes. Consider yourself warned.

This document is a **draft**!

## Patches are welcome

If you are a contributor, see the [CONTRIBUTING.md][contributing] file for instructions on how
to setup the developer environment to write your patches.

## Endpoints

| endpoint | methods | requires authentication |
|----------|------|---------|
| ```/v1/customers``` | [POST](#create-a-customer) | yes |
| ```/v1/customers/{ customerId }``` | [GET](#get-customer-info), [PUT](#update-customer-info) | yes |
| ```/v1/bots``` | [POST](#create-a-bot) | yes |
| ```/v1/bots/{ botId }``` | [GET](#get-bot-config), [PUT](#update-bot-config) | yes |
| ```/v1/users``` | [POST](#create-a-user) | yes |
| ```/v1/users/{ userId }``` | [GET](#get-user-info), [PUT](#update-user-info) | yes |

## Authenticated requests

For using endpoints that requires authentication, you must pass an
```Authentication``` header with the value ```Bearer your_access_token```.
The access token for the v1 of this api is a Facebook accessToken that
can be obtained with a [Facebook Login Popup][facebooklogin] using the app ID of
a facebook app that your API server is configured to expect (step 1.1 of the
[Contributing Guide][contributing]).

### Example:
```shell
curl --request GET \
  --url https://api.example.com/latest/v1/customers/048c37f5-17fb-4f3f-82de-8014230d3922 \
  --header 'authorization: Bearer EAA...ZD' \
  --header 'content-type: application/json'
```

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

##### Responses
- 201 (application/json)
```json
{
	"id": "1384770a-d4eb-4566-9d80-b0be5b8c2c61",
	"facebookId": "10154544223979636",
	"name": "Fabricio Campos Zuardi",
	"email": "fabricio@fabricio.org",
	"bots": []
}
```
- 500 (text/plain)
```text
{
	"error": {
		"message": "The facebook id 10154544223979636 is already connected to an existing user",
		"userId": "1384770a-d4eb-4566-9d80-b0be5b8c2c61"
	}
}
```
- 500 (text/plain)
```text
{
	"error": {
		"message": "Error validating access token: The session is invalid because the user logged out.",
		"type": "OAuthException",
		"code": 190,
		"error_subcode": 467,
		"fbtrace_id": "DIOWQtQq2KC"
	}
}
```
- 500 (text/plain)
```text
{
	"error": {
		"message": "Error validating access token: Session has expired on Wednesday, 07-Sep-16 22:00:00 PDT. The current time is Wednesday, 07-Sep-16 22:05:47 PDT.",
		"type": "OAuthException",
		"code": 190,
		"error_subcode": 463,
		"fbtrace_id": "Cj21SvLn4aZ"
	}
}
```

#### Get customer info
##### Request
GET ```/v1/customers/{ customerId }```

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

#### Update customer info
##### Request
PUT ```/v1/customers/{ customerId }```


### Bots

Programs configured by system [customers](customers), that can listen/reply to [users](#users) on chat platforms.

#### Create a bot
##### Request
POST ```/v1/bots```

##### Parameters

- ```customerId``` the id of the customer

#### Get bot config
##### Request
POST ```/v1/bots/{ botId }```
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
PUT ```/v1/bots/{ botId }```

### Users

An user is a recipient that a [bot](#bot) can chat to. Examples: a messenger
user, a chat group, an IRC channel…

#### Create a user

##### Request
POST ```/v1/users```

##### Parameters

- ```botId```

#### Get user info

GET ```/v1/users/{ userId }```

#### Update user info

PUT ```/v1/users/{ userId }```



[facebooklogin]: https://developers.facebook.com/docs/facebook-login/web
[contributing]: https://github.com/calamar-io/controltower-api/blob/master/CONTRIBUTING.md
