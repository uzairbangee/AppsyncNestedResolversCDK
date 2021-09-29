import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as AppsyncExample from '../lib/appsync-example-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new AppsyncExample.AppsyncExampleStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
