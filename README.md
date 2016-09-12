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
that interact/chat with her customers ([users](#users)).

#### Create a customer

Will attempt to create a new customer connected with the Facebook user ID that
generated the login access token.

Returns the created Controltower user, or the existing one if there is one already
for that Facebook user ID.

##### Request
POST ```/v1/customers```

##### Successful Response
- 201 (application/json)
```json
{
	"id": "048c37f5-17fb-4f3f-82de-8014230d3922",
	"email": "fabricio@fabricio.org",
	"name": "Fabricio Campos Zuardi",
	"facebookId": "10154544223979636",
	"bots": []
}
```

#### Get customer info
##### Request
GET ```/v1/customers/{ customerId }```

##### Successful Response
- 200 (application/json)
```json
{
	"id": "048c37f5-17fb-4f3f-82de-8014230d3922",
	"email": "fabricio@fabricio.org",
	"name": "Fabricio Campos Zuardi",
	"facebookId": "10154544223979636",
	"bots": []
}
```

#### Update customer info
##### Request
PUT ```/v1/customers/{ customerId }```

- body: a json containing the attributes and values to update

##### curl example
```shell
curl --request PUT \
  --url https://api.example.com/latest/v1/customers/87df2a3e-7a68-43aa-bba2-f6fe6d08f089 \
  --header 'authorization: Bearer EAA...ZD' \
  --header 'content-type: application/json' \
  --data '{
	"name": "James Morgan McGill",
	"email": "james@example.com"
}'
```

##### Successful Response
- 200 (application/json)
```json
{
	"id": "048c37f5-17fb-4f3f-82de-8014230d3922",
	"email": "james@example.com",
	"name": "James Morgan McGill",
	"facebookId": "10154544223979636",
	"bots": []
}
```

### Bots

Programs configured by system [customers](customers), that can listen/reply to [users](#users) on chat platforms.

#### Create a bot
##### Request
POST ```/v1/bots```

TBD

#### Get bot config
##### Request
POST ```/v1/bots/{ botId }```

TBD

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

TBD

### Users

An user is a recipient that a [bot](#bot) can chat to. Examples: a messenger
user, a chat group, an IRC channel…

#### Create a user

##### Request
POST ```/v1/users```

TBD

##### Parameters

- ```botId```

#### Get user info

GET ```/v1/users/{ userId }```

TBD

#### Update user info

PUT ```/v1/users/{ userId }```

TBD

### Examples of error responses

- 500 (text/plain)
```text
{
	"error": {
		"message": "No authorization header"
	}
}
```
- 500 (text/plain)
```text
{
	"error": {
		"message": "Malformed access token",
		"type": "OAuthException",
		"code": 190,
		"fbtrace_id": "Aj+ON1w7Fl8"
	}
}
```
- 500 (text/plain)
```text
{
	"error": {
		"message": "The access token could not be decrypted",
		"type": "OAuthException",
		"code": 190,
		"fbtrace_id": "HJYUlys/FGb"
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


[facebooklogin]: https://developers.facebook.com/docs/facebook-login/web
[contributing]: https://github.com/calamar-io/controltower-api/blob/master/CONTRIBUTING.md
