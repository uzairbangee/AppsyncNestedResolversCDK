import * as cdk from '@aws-cdk/core';
import * as appsync from '@aws-cdk/aws-appsync';
import * as lambda from '@aws-cdk/aws-lambda';

export class AppsyncExampleStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const layer = new lambda.LayerVersion(this, "Layer", {
      code: lambda.Code.fromAsset('lambda-layer')
    })

    // The code that defines your stack goes here
    const api = new appsync.GraphqlApi(this, "GRAPHQL_API", {
      name: 'cdk-api',
      schema: appsync.Schema.fromAsset('schema/schema.gql'),       ///Path specified for lambda
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,     ///Defining Authorization Type
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365))   ///set expiration for API Key
          }
        },
      },
      xrayEnabled: true                                             ///Enables xray debugging
    })

    ///Print Graphql Api Url on console after deploy
    new cdk.CfnOutput(this, "APIGraphQlURL", {
      value: api.graphqlUrl
    })

    ///Print API Key on console after deploy
    new cdk.CfnOutput(this, "GraphQLAPIKey", {
      value: api.apiKey || ''
    });

    ///Lambda Fucntion
    const lambda_function = new lambda.Function(this, "EmployeeLambdaFucntion", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("lambda/query"),
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(10),
      layers: [layer]
    })

    ///Lambda Fucntion
    const employeer_lambda_function = new lambda.Function(this, "EmployeerLambdaFucntion", {
      runtime: lambda.Runtime.NODEJS_12_X,            ///set nodejs runtime environment
      code: lambda.Code.fromAsset("lambda/employeer"),          ///path for lambda function directory
      handler: 'index.handler',                       ///specfic fucntion in specific file
      timeout: cdk.Duration.seconds(10),               ///Time for function to break. limit upto 15 mins
      layers: [layer]
    })

    const employees_lambda_function = new lambda.Function(this, "EmployeesLambdaFucntion", {
      runtime: lambda.Runtime.NODEJS_12_X,            ///set nodejs runtime environment
      code: lambda.Code.fromAsset("lambda/employees"),          ///path for lambda function directory
      handler: 'index.handler',                       ///specfic fucntion in specific file
      timeout: cdk.Duration.seconds(10),               ///Time for function to break. limit upto 15 mins
      layers: [layer]
    })

    const lambda_data_source = api.addLambdaDataSource("lamdaDataSource", lambda_function);
    const employeer_lambda_data_source = api.addLambdaDataSource("employer", employeer_lambda_function);
    const employees_lambda_data_source = api.addLambdaDataSource("employees", employees_lambda_function);

    lambda_data_source.createResolver({
      typeName: "Query",
      fieldName: "employees"
    })

    employeer_lambda_data_source.createResolver({
      typeName: "Employee",
      fieldName: "employer",
      requestMappingTemplate : appsync.MappingTemplate.fromString(`
        {
          "version" : "2017-02-28",
          "operation": "Invoke",
          "payload": $util.toJson({"employerId" : $context.source.employerId })
        }
      `)
    })

    employees_lambda_data_source.createResolver({
      typeName: "Employer",
      fieldName: "employees",
      requestMappingTemplate : appsync.MappingTemplate.fromString(`
        {
          "version" : "2017-02-28",
          "operation": "Invoke",
          "payload": $util.toJson({"employerId" : $context.source.id })
        }
      `)
    })

  }
}
