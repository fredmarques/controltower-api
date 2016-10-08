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
| ```/v1/users``` | [POST](#create-a-user), [GET](#query-users-with-muted-bot), [PUT](#unmute-bot-for-multiple-users) | yes |
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
  --url https://api.example.com/v1/customers/87df2a3e-7a68-43aa-bba2-f6fe6d08f089 \
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

##### Successful Response
- 200 (application/json)
```json
{
	"customerId": "87df2a3e-7a68-43aa-bba2-f6fe6d08f089",
	"id": "4853d957-1cde-4b37-b5d1-cdf14512114b",
	"users": []
}
```

#### Get bot config
##### Request
GET ```/v1/bots/{ botId }```

##### Query string parameters
- customerId (optional)

##### curl example
```shell
curl --request GET \
  --url 'https://api.example.com/v1/bots/4cd94422-7598-4405-946a-1861ce9a4168?customerId=87df2a3e-7a68-43aa-bba2-f6fe6d08f089' \
  --header 'authorization: Bearer EAA...DZD' \
  --header 'content-type: application/json'
```

##### Successful Response
- 200 (application/json)

```json
{
	"id": "4cd94422-7598-4405-946a-1861ce9a4168",
	"customerId": "87df2a3e-7a68-43aa-bba2-f6fe6d08f089"
}
```

#### Update bot config

##### Request
PUT ```/v1/bots/{ botId }```

- body: a json containing the attributes and values to update

##### curl example
```shell
curl --request PUT \
  --url https://api.example.com/v1/bots/bc74d285-2fdf-4a77-990b-f412273bad5f \
  --header 'authorization: Bearer EAA...ZD' \
  --header 'content-type: application/json' \
  --data '{
	"foo": "bar",
	"bar": "foo"
}'
```

##### Successful Response
- 200 (application/json)

```json
{
	"id": "bc74d285-2fdf-4a77-990b-f412273bad5f",
	"foo": "bar",
	"customerId": "87df2a3e-7a68-43aa-bba2-f6fe6d08f089",
	"bar": "foo"
}
```

##### Special cases
###### Generate new bot config invite code

If in the body of the request you send an ```"inviteCode"``` of value ```"new"```
then the existing inviteCode will be invalidated and a new one will be generated.

###### Add a new customer to the list of bot admins

If in the body of the request you send an ```"admins"``` key with value ```"me"```,
and an ```"inviteCode"``` key with a valid inviteCode value, and a ```customerId```
with the id of the bot owner the customer making the request will be added to
the admins access list of that bot.

Example body:

```json
{
	"admins": "me",
	"inviteCode": "ry7ECzB0",
	"customerId": "735aa084-c5bb-4808-a8a2-ffe6d83f0c0d"
}
```

###### Remove a customer from the list of bot admins

TBD

### Users

An user is a recipient that a [bot](#bot) can chat to. Examples: a messenger
user, a chat group, an IRC channel…

#### Create a user

##### Request
POST ```/v1/users```

- body: a json containing information about the chat session (facebook Id of the recipient) and the bot listening to that session (botId). Optionally you
can also include the id of the customer that owns that bot (customerId) to speed
things up.
    - example body:
    ```json
    {
    	"botId": "4853d957-1cde-4b37-b5d1-cdf14512114b",
	    "customerId": "87df2a3e-7a68-43aa-bba2-f6fe6d08f089",
	    "facebookId": "10154544223979636"
    }
```

##### Successful Response
- 200 (application/json)

```json
{
	"botId": "4853d957-1cde-4b37-b5d1-cdf14512114b",
	"id": "db00fe66-0475-4471-9bb7-b3f099bd6e97",
	"facebookId": "10154544223979636"
}
```

#### Get user info

GET ```/v1/users/{ userId }```

##### Query string parameters
- **botId** (required)
- customerId (optional)

##### Successful Response
- 200 (application/json)

```json
{
	"botId": "4853d957-1cde-4b37-b5d1-cdf14512114b",
	"id": "050e8b79-f52b-4746-8672-c45b83582049",
	"facebookId": "10154544223979636"
}
```

#### Query users with muted bot


GET ```/v1/users```

##### Query string parameters
- botId

##### curl example
```shell
curl --request GET \
  --url 'https://api.example.com/v1/users?botId=00950d32-2059-42c7-8f91-b30515fc7f15' \
  --header 'authorization: Bearer EAA...DZD' \
  --header 'content-type: application/json'

```

##### Successful Response
- 200 (application/json)

```json
[
	{
		"botId": "00950d32-2059-42c7-8f91-b30515fc7f15",
		"id": "52f42726-9f8d-4728-bbf2-7229bc753769",
		"botStatus": "muted",
		"facebookId": "10154544223979636"
	}
]
```

##### Unmute bot for multiple users

PUT ```/v1/users```

##### curl example
```shell
curl --request PUT \
  --url https://api.example.com/v1/users \
  --header 'authorization: Bearer EAA...DZD' \
  --header 'content-type: application/json' \
  --data '{
	"ids": [
		"52f42726-9f8d-4728-bbf2-7229bc753769",
		"52f42726-9f8d-4728-bbf2-7229bc753769"
	],
	"botId": "00950d32-2059-42c7-8f91-b30515fc7f15",
	"update": {
		"botStatus": "muted"
	}
}'
```

#### Update user info

PUT ```/v1/users/{ userId }```

- body: a json containing the list of ```ids``` of users to change, the ```botId```
and an ```update``` attribute containing the attributes to update on all users.

##### curl example
```shell
curl --request PUT \
  --url https://api.example.com/latest/v1/users \
  --header 'authorization: Bearer EAA...ZD' \
  --header 'content-type: application/json' \
  --data '{
	"ids": [
		"52f42726-9f8d-4728-bbf2-7229bc753769",
		"a17f26f6-85b4-4502-b1aa-6fdae8b6af81"
	],
	"botId": "00950d32-2059-42c7-8f91-b30515fc7f15",
	"update": {
		"botStatus": "muted"
	}
}'
```

##### Successful Response
- 200 (application/json)

```json
{
	"botId": "00950d32-2059-42c7-8f91-b30515fc7f15",
	"id": "52f42726-9f8d-4728-bbf2-7229bc753769",
	"facebookId": "10154544223979636",
	"botStatus": "active"
}
```

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
		"message": "Invalid customerId"
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
