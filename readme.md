# Hasura + Nodejs

**Steps for Nodejs**

 1. Run `docker-compose up -d`
 2. Run `mutation{login(username: "admin",  password: "admin"){ token }}`
 3. Copy Token

**Steps for Hasura**

 1. Go to Hasura folder
 2. Run `docker-compose up -d`
 3. Run `hasura metadata apply`
 4. Run `hasura migrate apply`
 5. Run `hasura metadata apply`
 6. Open hasura console on `localhost:8080`
 7. Add `Authorization` header and put `Bearer <token copied from nodejs login response>`
 8. Run `Near by Location` specified below and DONE :)

# Login mutation to run on Nodejs server
  `mutation{
    login(username: "admin", password: "admin"){
        token
    }
  }`

# User Query with Pagination & Near by Location

     `
     
     query findNearbyUsers(
  $distance_kms: Int!,
  $userId: String!
){
  findNearbyUsers(
    distance_kms: $distance_kms,
    userId: $userId
  )
}

    --- Variables ---
    {
	"distance_kms": 10,
  "userId": "78479069-2be6-4673-957c-9b046f1bdcb4"
}


    
    `