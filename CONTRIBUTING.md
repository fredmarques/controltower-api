### 1. Create your dev environment:

#### 1.1. Fill in the blanks on a ```config.js``` file
```shell
cp config-sample.js config.js
$EDITOR config.js
```

#### 1.2. Install dev dependencies and build the AWS Lambda distribution
```shell
npm install
npm run build:aws
npm run create:aws -- --name=controltower-api-SOME_USERNAME_HERE
```

### 2. Test your API

#### 2.1 Get an access token

Access a running controltower webpage with the developer tools open and copy
the Facebook accessToken from the console tab.

#### 2.2 Start making requests

```shell
curl --request POST \
  --url https://YOUR_CLAUDIA_ID.execute-api.us-east-1.amazonaws.com/latest/v1/customers \
  --header 'authorization: Bearer YOUR_ACCESS_TOKEN' \
  --header 'content-type: application/json'
```

### 3. Edit ```src/aws.js```

### 4. Deploy your patched API

```
npm run publish:aws
```
