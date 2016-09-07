### 1. Create your dev environment:

```
npm install
npm run build:aws
npm run create:aws -- --name=control-tower-api-SOME_USERNAME_HERE
```

### 2. Test your API

```
curl https://YOUR_CLAUDIA_ID.execute-api.us-east-1.amazonaws.com/latest/v1/customers --data {}
```

### 3. Edit ```src/aws.js```

### 4. Deploy your API

```
npm run publish:aws
```

### 5. Test your API

```
curl https://YOUR_CLAUDIA_ID.execute-api.us-east-1.amazonaws.com/latest/v1/customers --data {}
```
