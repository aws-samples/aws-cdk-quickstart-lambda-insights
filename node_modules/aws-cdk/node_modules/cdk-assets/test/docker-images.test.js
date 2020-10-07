"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
jest.mock('child_process');
const cloud_assembly_schema_1 = require("@aws-cdk/cloud-assembly-schema");
const mockfs = require("mock-fs");
const lib_1 = require("../lib");
const mock_aws_1 = require("./mock-aws");
const mock_child_process_1 = require("./mock-child_process");
let aws;
const absoluteDockerPath = '/simple/cdk.out/dockerdir';
beforeEach(() => {
    mockfs({
        '/simple/cdk.out/assets.json': JSON.stringify({
            version: cloud_assembly_schema_1.Manifest.version(),
            dockerImages: {
                theAsset: {
                    source: {
                        directory: 'dockerdir',
                    },
                    destinations: {
                        theDestination: {
                            region: 'us-north-50',
                            assumeRoleArn: 'arn:aws:role',
                            repositoryName: 'repo',
                            imageTag: 'abcdef',
                        },
                    },
                },
            },
        }),
        '/simple/cdk.out/dockerdir/Dockerfile': 'FROM scratch',
        '/abs/cdk.out/assets.json': JSON.stringify({
            version: cloud_assembly_schema_1.Manifest.version(),
            dockerImages: {
                theAsset: {
                    source: {
                        directory: absoluteDockerPath,
                    },
                    destinations: {
                        theDestination: {
                            region: 'us-north-50',
                            assumeRoleArn: 'arn:aws:role',
                            repositoryName: 'repo',
                            imageTag: 'abcdef',
                        },
                    },
                },
            },
        }),
    });
    aws = mock_aws_1.mockAws();
});
afterEach(() => {
    mockfs.restore();
});
test('pass destination properties to AWS client', async () => {
    const pub = new lib_1.AssetPublishing(lib_1.AssetManifest.fromPath('/simple/cdk.out'), { aws, throwOnError: false });
    await pub.publish();
    expect(aws.ecrClient).toHaveBeenCalledWith(expect.objectContaining({
        region: 'us-north-50',
        assumeRoleArn: 'arn:aws:role',
    }));
});
describe('with a complete manifest', () => {
    let pub;
    beforeEach(() => {
        pub = new lib_1.AssetPublishing(lib_1.AssetManifest.fromPath('/simple/cdk.out'), { aws });
    });
    test('Do nothing if docker image already exists', async () => {
        aws.mockEcr.describeImages = mock_aws_1.mockedApiResult({ /* No error == image exists */});
        await pub.publish();
        expect(aws.mockEcr.describeImages).toHaveBeenCalledWith(expect.objectContaining({
            imageIds: [{ imageTag: 'abcdef' }],
            repositoryName: 'repo',
        }));
    });
    test('upload docker image if not uploaded yet but exists locally', async () => {
        aws.mockEcr.describeImages = mock_aws_1.mockedApiFailure('ImageNotFoundException', 'File does not exist');
        aws.mockEcr.getAuthorizationToken = mock_aws_1.mockedApiResult({
            authorizationData: [
                { authorizationToken: 'dXNlcjpwYXNz', proxyEndpoint: 'https://proxy.com/' },
            ],
        });
        mock_child_process_1.mockSpawn({ commandLine: ['docker', 'login', '--username', 'user', '--password-stdin', 'https://proxy.com/'] }, { commandLine: ['docker', 'inspect', 'cdkasset-theasset'] }, { commandLine: ['docker', 'tag', 'cdkasset-theasset', '12345.amazonaws.com/repo:abcdef'] }, { commandLine: ['docker', 'push', '12345.amazonaws.com/repo:abcdef'] });
        await pub.publish();
    });
    test('build and upload docker image if not exists anywhere', async () => {
        aws.mockEcr.describeImages = mock_aws_1.mockedApiFailure('ImageNotFoundException', 'File does not exist');
        aws.mockEcr.getAuthorizationToken = mock_aws_1.mockedApiResult({
            authorizationData: [
                { authorizationToken: 'dXNlcjpwYXNz', proxyEndpoint: 'https://proxy.com/' },
            ],
        });
        mock_child_process_1.mockSpawn({ commandLine: ['docker', 'login', '--username', 'user', '--password-stdin', 'https://proxy.com/'] }, { commandLine: ['docker', 'inspect', 'cdkasset-theasset'], exitCode: 1 }, { commandLine: ['docker', 'build', '--tag', 'cdkasset-theasset', '.'], cwd: absoluteDockerPath }, { commandLine: ['docker', 'tag', 'cdkasset-theasset', '12345.amazonaws.com/repo:abcdef'] }, { commandLine: ['docker', 'push', '12345.amazonaws.com/repo:abcdef'] });
        await pub.publish();
    });
});
test('correctly identify Docker directory if path is absolute', async () => {
    const pub = new lib_1.AssetPublishing(lib_1.AssetManifest.fromPath('/abs/cdk.out'), { aws });
    aws.mockEcr.describeImages = mock_aws_1.mockedApiFailure('ImageNotFoundException', 'File does not exist');
    aws.mockEcr.getAuthorizationToken = mock_aws_1.mockedApiResult({
        authorizationData: [
            { authorizationToken: 'dXNlcjpwYXNz', proxyEndpoint: 'https://proxy.com/' },
        ],
    });
    mock_child_process_1.mockSpawn(
    // Only care about the 'build' command line
    { commandLine: ['docker', 'login'], prefix: true }, { commandLine: ['docker', 'inspect'], exitCode: 1, prefix: true }, { commandLine: ['docker', 'build', '--tag', 'cdkasset-theasset', '.'], cwd: absoluteDockerPath }, { commandLine: ['docker', 'tag'], prefix: true }, { commandLine: ['docker', 'push'], prefix: true });
    await pub.publish();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9ja2VyLWltYWdlcy50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZG9ja2VyLWltYWdlcy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUUzQiwwRUFBMEQ7QUFDMUQsa0NBQWtDO0FBQ2xDLGdDQUF3RDtBQUN4RCx5Q0FBd0U7QUFDeEUsNkRBQWlEO0FBRWpELElBQUksR0FBK0IsQ0FBQztBQUNwQyxNQUFNLGtCQUFrQixHQUFHLDJCQUEyQixDQUFDO0FBQ3ZELFVBQVUsQ0FBQyxHQUFHLEVBQUU7SUFDZCxNQUFNLENBQUM7UUFDTCw2QkFBNkIsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO1lBQzVDLE9BQU8sRUFBRSxnQ0FBUSxDQUFDLE9BQU8sRUFBRTtZQUMzQixZQUFZLEVBQUU7Z0JBQ1osUUFBUSxFQUFFO29CQUNSLE1BQU0sRUFBRTt3QkFDTixTQUFTLEVBQUUsV0FBVztxQkFDdkI7b0JBQ0QsWUFBWSxFQUFFO3dCQUNaLGNBQWMsRUFBRTs0QkFDZCxNQUFNLEVBQUUsYUFBYTs0QkFDckIsYUFBYSxFQUFFLGNBQWM7NEJBQzdCLGNBQWMsRUFBRSxNQUFNOzRCQUN0QixRQUFRLEVBQUUsUUFBUTt5QkFDbkI7cUJBQ0Y7aUJBQ0Y7YUFDRjtTQUNGLENBQUM7UUFDRixzQ0FBc0MsRUFBRSxjQUFjO1FBQ3RELDBCQUEwQixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDekMsT0FBTyxFQUFFLGdDQUFRLENBQUMsT0FBTyxFQUFFO1lBQzNCLFlBQVksRUFBRTtnQkFDWixRQUFRLEVBQUU7b0JBQ1IsTUFBTSxFQUFFO3dCQUNOLFNBQVMsRUFBRSxrQkFBa0I7cUJBQzlCO29CQUNELFlBQVksRUFBRTt3QkFDWixjQUFjLEVBQUU7NEJBQ2QsTUFBTSxFQUFFLGFBQWE7NEJBQ3JCLGFBQWEsRUFBRSxjQUFjOzRCQUM3QixjQUFjLEVBQUUsTUFBTTs0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QWdCLENBQUMsd0JBQXdCLEVBQUUscUJBQXFCLENBQUMsQ0FBQztJQUMvRixHQUFHLENBQUMsT0FBTyxDQUFDLHFCQUFxQixHQUFHLDBCQUFlLENBQUM7UUFDbEQsaUJBQWlCLEVBQUU7WUFDakIsRUFBRSxrQkFBa0IsRUFBRSxjQUFjLEVBQUUsYUFBYSxFQUFFLG9CQUFvQixFQUFFO1NBQzVFO0tBQ0YsQ0FBQyxDQUFDO0lBRUgsOEJBQVM7SUFDUCwyQ0FBMkM7SUFDM0MsRUFBRSxXQUFXLEVBQUUsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxFQUNsRCxFQUFFLFdBQVcsRUFBRSxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsRUFDakUsRUFBRSxXQUFXLEVBQUUsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsa0JBQWtCLEVBQUUsRUFDaEcsRUFBRSxXQUFXLEVBQUUsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxFQUNoRCxFQUFFLFdBQVcsRUFBRSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQ2xELENBQUM7SUFFRixNQUFNLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN0QixDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImplc3QubW9jaygnY2hpbGRfcHJvY2VzcycpO1xuXG5pbXBvcnQgeyBNYW5pZmVzdCB9IGZyb20gJ0Bhd3MtY2RrL2Nsb3VkLWFzc2VtYmx5LXNjaGVtYSc7XG5pbXBvcnQgKiBhcyBtb2NrZnMgZnJvbSAnbW9jay1mcyc7XG5pbXBvcnQgeyBBc3NldE1hbmlmZXN0LCBBc3NldFB1Ymxpc2hpbmcgfSBmcm9tICcuLi9saWInO1xuaW1wb3J0IHsgbW9ja0F3cywgbW9ja2VkQXBpRmFpbHVyZSwgbW9ja2VkQXBpUmVzdWx0IH0gZnJvbSAnLi9tb2NrLWF3cyc7XG5pbXBvcnQgeyBtb2NrU3Bhd24gfSBmcm9tICcuL21vY2stY2hpbGRfcHJvY2Vzcyc7XG5cbmxldCBhd3M6IFJldHVyblR5cGU8dHlwZW9mIG1vY2tBd3M+O1xuY29uc3QgYWJzb2x1dGVEb2NrZXJQYXRoID0gJy9zaW1wbGUvY2RrLm91dC9kb2NrZXJkaXInO1xuYmVmb3JlRWFjaCgoKSA9PiB7XG4gIG1vY2tmcyh7XG4gICAgJy9zaW1wbGUvY2RrLm91dC9hc3NldHMuanNvbic6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgIHZlcnNpb246IE1hbmlmZXN0LnZlcnNpb24oKSxcbiAgICAgIGRvY2tlckltYWdlczoge1xuICAgICAgICB0aGVBc3NldDoge1xuICAgICAgICAgIHNvdXJjZToge1xuICAgICAgICAgICAgZGlyZWN0b3J5OiAnZG9ja2VyZGlyJyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGRlc3RpbmF0aW9uczoge1xuICAgICAgICAgICAgdGhlRGVzdGluYXRpb246IHtcbiAgICAgICAgICAgICAgcmVnaW9uOiAndXMtbm9ydGgtNTAnLFxuICAgICAgICAgICAgICBhc3N1bWVSb2xlQXJuOiAnYXJuOmF3czpyb2xlJyxcbiAgICAgICAgICAgICAgcmVwb3NpdG9yeU5hbWU6ICdyZXBvJyxcbiAgICAgICAgICAgICAgaW1hZ2VUYWc6ICdhYmNkZWYnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9KSxcbiAgICAnL3NpbXBsZS9jZGsub3V0L2RvY2tlcmRpci9Eb2NrZXJmaWxlJzogJ0ZST00gc2NyYXRjaCcsXG4gICAgJy9hYnMvY2RrLm91dC9hc3NldHMuanNvbic6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgIHZlcnNpb246IE1hbmlmZXN0LnZlcnNpb24oKSxcbiAgICAgIGRvY2tlckltYWdlczoge1xuICAgICAgICB0aGVBc3NldDoge1xuICAgICAgICAgIHNvdXJjZToge1xuICAgICAgICAgICAgZGlyZWN0b3J5OiBhYnNvbHV0ZURvY2tlclBhdGgsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBkZXN0aW5hdGlvbnM6IHtcbiAgICAgICAgICAgIHRoZURlc3RpbmF0aW9uOiB7XG4gICAgICAgICAgICAgIHJlZ2lvbjogJ3VzLW5vcnRoLTUwJyxcbiAgICAgICAgICAgICAgYXNzdW1lUm9sZUFybjogJ2Fybjphd3M6cm9sZScsXG4gICAgICAgICAgICAgIHJlcG9zaXRvcnlOYW1lOiAncmVwbycsXG4gICAgICAgICAgICAgIGltYWdlVGFnOiAnYWJjZGVmJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSksXG4gIH0pO1xuXG4gIGF3cyA9IG1vY2tBd3MoKTtcbn0pO1xuXG5hZnRlckVhY2goKCkgPT4ge1xuICBtb2NrZnMucmVzdG9yZSgpO1xufSk7XG5cbnRlc3QoJ3Bhc3MgZGVzdGluYXRpb24gcHJvcGVydGllcyB0byBBV1MgY2xpZW50JywgYXN5bmMgKCkgPT4ge1xuICBjb25zdCBwdWIgPSBuZXcgQXNzZXRQdWJsaXNoaW5nKEFzc2V0TWFuaWZlc3QuZnJvbVBhdGgoJy9zaW1wbGUvY2RrLm91dCcpLCB7IGF3cywgdGhyb3dPbkVycm9yOiBmYWxzZSB9KTtcblxuICBhd2FpdCBwdWIucHVibGlzaCgpO1xuXG4gIGV4cGVjdChhd3MuZWNyQ2xpZW50KS50b0hhdmVCZWVuQ2FsbGVkV2l0aChleHBlY3Qub2JqZWN0Q29udGFpbmluZyh7XG4gICAgcmVnaW9uOiAndXMtbm9ydGgtNTAnLFxuICAgIGFzc3VtZVJvbGVBcm46ICdhcm46YXdzOnJvbGUnLFxuICB9KSk7XG59KTtcblxuZGVzY3JpYmUoJ3dpdGggYSBjb21wbGV0ZSBtYW5pZmVzdCcsICgpID0+IHtcbiAgbGV0IHB1YjogQXNzZXRQdWJsaXNoaW5nO1xuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICBwdWIgPSBuZXcgQXNzZXRQdWJsaXNoaW5nKEFzc2V0TWFuaWZlc3QuZnJvbVBhdGgoJy9zaW1wbGUvY2RrLm91dCcpLCB7IGF3cyB9KTtcbiAgfSk7XG5cbiAgdGVzdCgnRG8gbm90aGluZyBpZiBkb2NrZXIgaW1hZ2UgYWxyZWFkeSBleGlzdHMnLCBhc3luYyAoKSA9PiB7XG4gICAgYXdzLm1vY2tFY3IuZGVzY3JpYmVJbWFnZXMgPSBtb2NrZWRBcGlSZXN1bHQoeyAvKiBObyBlcnJvciA9PSBpbWFnZSBleGlzdHMgKi8gfSk7XG5cbiAgICBhd2FpdCBwdWIucHVibGlzaCgpO1xuXG4gICAgZXhwZWN0KGF3cy5tb2NrRWNyLmRlc2NyaWJlSW1hZ2VzKS50b0hhdmVCZWVuQ2FsbGVkV2l0aChleHBlY3Qub2JqZWN0Q29udGFpbmluZyh7XG4gICAgICBpbWFnZUlkczogW3sgaW1hZ2VUYWc6ICdhYmNkZWYnIH1dLFxuICAgICAgcmVwb3NpdG9yeU5hbWU6ICdyZXBvJyxcbiAgICB9KSk7XG4gIH0pO1xuXG4gIHRlc3QoJ3VwbG9hZCBkb2NrZXIgaW1hZ2UgaWYgbm90IHVwbG9hZGVkIHlldCBidXQgZXhpc3RzIGxvY2FsbHknLCBhc3luYyAoKSA9PiB7XG4gICAgYXdzLm1vY2tFY3IuZGVzY3JpYmVJbWFnZXMgPSBtb2NrZWRBcGlGYWlsdXJlKCdJbWFnZU5vdEZvdW5kRXhjZXB0aW9uJywgJ0ZpbGUgZG9lcyBub3QgZXhpc3QnKTtcbiAgICBhd3MubW9ja0Vjci5nZXRBdXRob3JpemF0aW9uVG9rZW4gPSBtb2NrZWRBcGlSZXN1bHQoe1xuICAgICAgYXV0aG9yaXphdGlvbkRhdGE6IFtcbiAgICAgICAgeyBhdXRob3JpemF0aW9uVG9rZW46ICdkWE5sY2pwd1lYTnonLCBwcm94eUVuZHBvaW50OiAnaHR0cHM6Ly9wcm94eS5jb20vJyB9LFxuICAgICAgXSxcbiAgICB9KTtcblxuICAgIG1vY2tTcGF3bihcbiAgICAgIHsgY29tbWFuZExpbmU6IFsnZG9ja2VyJywgJ2xvZ2luJywgJy0tdXNlcm5hbWUnLCAndXNlcicsICctLXBhc3N3b3JkLXN0ZGluJywgJ2h0dHBzOi8vcHJveHkuY29tLyddIH0sXG4gICAgICB7IGNvbW1hbmRMaW5lOiBbJ2RvY2tlcicsICdpbnNwZWN0JywgJ2Nka2Fzc2V0LXRoZWFzc2V0J10gfSxcbiAgICAgIHsgY29tbWFuZExpbmU6IFsnZG9ja2VyJywgJ3RhZycsICdjZGthc3NldC10aGVhc3NldCcsICcxMjM0NS5hbWF6b25hd3MuY29tL3JlcG86YWJjZGVmJ10gfSxcbiAgICAgIHsgY29tbWFuZExpbmU6IFsnZG9ja2VyJywgJ3B1c2gnLCAnMTIzNDUuYW1hem9uYXdzLmNvbS9yZXBvOmFiY2RlZiddIH0sXG4gICAgKTtcblxuICAgIGF3YWl0IHB1Yi5wdWJsaXNoKCk7XG4gIH0pO1xuXG4gIHRlc3QoJ2J1aWxkIGFuZCB1cGxvYWQgZG9ja2VyIGltYWdlIGlmIG5vdCBleGlzdHMgYW55d2hlcmUnLCBhc3luYyAoKSA9PiB7XG4gICAgYXdzLm1vY2tFY3IuZGVzY3JpYmVJbWFnZXMgPSBtb2NrZWRBcGlGYWlsdXJlKCdJbWFnZU5vdEZvdW5kRXhjZXB0aW9uJywgJ0ZpbGUgZG9lcyBub3QgZXhpc3QnKTtcbiAgICBhd3MubW9ja0Vjci5nZXRBdXRob3JpemF0aW9uVG9rZW4gPSBtb2NrZWRBcGlSZXN1bHQoe1xuICAgICAgYXV0aG9yaXphdGlvbkRhdGE6IFtcbiAgICAgICAgeyBhdXRob3JpemF0aW9uVG9rZW46ICdkWE5sY2pwd1lYTnonLCBwcm94eUVuZHBvaW50OiAnaHR0cHM6Ly9wcm94eS5jb20vJyB9LFxuICAgICAgXSxcbiAgICB9KTtcblxuICAgIG1vY2tTcGF3bihcbiAgICAgIHsgY29tbWFuZExpbmU6IFsnZG9ja2VyJywgJ2xvZ2luJywgJy0tdXNlcm5hbWUnLCAndXNlcicsICctLXBhc3N3b3JkLXN0ZGluJywgJ2h0dHBzOi8vcHJveHkuY29tLyddIH0sXG4gICAgICB7IGNvbW1hbmRMaW5lOiBbJ2RvY2tlcicsICdpbnNwZWN0JywgJ2Nka2Fzc2V0LXRoZWFzc2V0J10sIGV4aXRDb2RlOiAxIH0sXG4gICAgICB7IGNvbW1hbmRMaW5lOiBbJ2RvY2tlcicsICdidWlsZCcsICctLXRhZycsICdjZGthc3NldC10aGVhc3NldCcsICcuJ10sIGN3ZDogYWJzb2x1dGVEb2NrZXJQYXRoIH0sXG4gICAgICB7IGNvbW1hbmRMaW5lOiBbJ2RvY2tlcicsICd0YWcnLCAnY2RrYXNzZXQtdGhlYXNzZXQnLCAnMTIzNDUuYW1hem9uYXdzLmNvbS9yZXBvOmFiY2RlZiddIH0sXG4gICAgICB7IGNvbW1hbmRMaW5lOiBbJ2RvY2tlcicsICdwdXNoJywgJzEyMzQ1LmFtYXpvbmF3cy5jb20vcmVwbzphYmNkZWYnXSB9LFxuICAgICk7XG5cbiAgICBhd2FpdCBwdWIucHVibGlzaCgpO1xuICB9KTtcbn0pO1xuXG50ZXN0KCdjb3JyZWN0bHkgaWRlbnRpZnkgRG9ja2VyIGRpcmVjdG9yeSBpZiBwYXRoIGlzIGFic29sdXRlJywgYXN5bmMgKCkgPT4ge1xuICBjb25zdCBwdWIgPSBuZXcgQXNzZXRQdWJsaXNoaW5nKEFzc2V0TWFuaWZlc3QuZnJvbVBhdGgoJy9hYnMvY2RrLm91dCcpLCB7IGF3cyB9KTtcblxuICBhd3MubW9ja0Vjci5kZXNjcmliZUltYWdlcyA9IG1vY2tlZEFwaUZhaWx1cmUoJ0ltYWdlTm90Rm91bmRFeGNlcHRpb24nLCAnRmlsZSBkb2VzIG5vdCBleGlzdCcpO1xuICBhd3MubW9ja0Vjci5nZXRBdXRob3JpemF0aW9uVG9rZW4gPSBtb2NrZWRBcGlSZXN1bHQoe1xuICAgIGF1dGhvcml6YXRpb25EYXRhOiBbXG4gICAgICB7IGF1dGhvcml6YXRpb25Ub2tlbjogJ2RYTmxjanB3WVhOeicsIHByb3h5RW5kcG9pbnQ6ICdodHRwczovL3Byb3h5LmNvbS8nIH0sXG4gICAgXSxcbiAgfSk7XG5cbiAgbW9ja1NwYXduKFxuICAgIC8vIE9ubHkgY2FyZSBhYm91dCB0aGUgJ2J1aWxkJyBjb21tYW5kIGxpbmVcbiAgICB7IGNvbW1hbmRMaW5lOiBbJ2RvY2tlcicsICdsb2dpbiddLCBwcmVmaXg6IHRydWUgfSxcbiAgICB7IGNvbW1hbmRMaW5lOiBbJ2RvY2tlcicsICdpbnNwZWN0J10sIGV4aXRDb2RlOiAxLCBwcmVmaXg6IHRydWUgfSxcbiAgICB7IGNvbW1hbmRMaW5lOiBbJ2RvY2tlcicsICdidWlsZCcsICctLXRhZycsICdjZGthc3NldC10aGVhc3NldCcsICcuJ10sIGN3ZDogYWJzb2x1dGVEb2NrZXJQYXRoIH0sXG4gICAgeyBjb21tYW5kTGluZTogWydkb2NrZXInLCAndGFnJ10sIHByZWZpeDogdHJ1ZSB9LFxuICAgIHsgY29tbWFuZExpbmU6IFsnZG9ja2VyJywgJ3B1c2gnXSwgcHJlZml4OiB0cnVlIH0sXG4gICk7XG5cbiAgYXdhaXQgcHViLnB1Ymxpc2goKTtcbn0pO1xuIl19