/*
  FOLLOW Event
  send('FOLLOW', {id: 'communityId'})

  FOLLOWING Event
  send('FOLLOWING', {status: true})

  AUTH Event
  send('AUTHENTICATED', {status: true})
*/

function createConfig() {
  return {
    id: 'partnerProfile',
    initial: 'loading',

    context: {
      slug: undefined,
      meta: undefined,
      followMachineServices: undefined,
      activitiesMachineServices: undefined,

      isFollowing: false,
      isAuthenticated: false,
    },

    states: {
      loading: {
        meta: {
          message: 'loading community data',
        },
        invoke: {
          id: 'queryCommunity',
          src: 'queryCommunity',
          onDone: [
            {
              meta: {
                message: 'community api call a success.',
              },
              cond: 'communityFound',
              actions: [
                'queryCommunitySuccess',
                'createFollowMachineServices',
                'createActivityMachineServices',
              ],
              target: 'communityLoaded',
            },
            {
              cond: 'communityNotFound',
              target: 'notFound',
            },
          ],
          onError: 'error',
        },
      },

      communityLoaded: {
        meta: {
          message: 'user data loaded, now idle.',
        },

        initial: 'unknown',

        on: {
          AUTHENTICATED: {
            actions: ['setIsAuthenticated'],
            target: '.unknown',
          },
        },

        states: {
          unknown: {
            meta: {
              message: 'user security status is unknown.',
            },
            on: {
              '': [
                {
                  cond: 'isAuthenticated',
                  target: 'authenticated',
                },
                {
                  cond: 'isUnAuthenticated',
                  target: 'unAuthenticated',
                },
              ],
            },
          },

          authenticated: {
            meta: {
              message: 'user is currently authenticated',
            },

            initial: 'loadFollowing',

            on: {
              FOLLOW: '.toggleFollow',
            },

            states: {
              loadFollowing: {
                meta: {
                  message: 'loading what communities the user follows.',
                },

                invoke: {
                  id: 'queryMyFollowing',
                  src: 'queryMyFollowing',
                  onDone: [
                    {
                      meta: {
                        message: 'load following api success.',
                      },
                      actions: ['queryMyFollowingSuccess'],
                      target: 'loaded',
                    },
                  ],

                  onError: {
                    meta: {
                      message: 'toggle follow api errored.',
                    },
                    target: 'error',
                  },
                },
              },

              toggleFollow: {
                meta: {
                  message: 'user requested to follow community.',
                },

                invoke: {
                  id: 'toggleFollow',
                  src: 'toggleFollow',
                  onDone: [
                    {
                      meta: {
                        message: 'toggle follow api success.',
                      },
                      actions: ['toggleFollowSuccess', 'refreshFollowers'],
                      target: 'loaded',
                    },
                  ],
                  onError: {
                    meta: {
                      message: 'toggle follow api errored.',
                    },
                    target: 'error',
                  },
                },
              },

              loaded: {},

              error: {
                entry: 'logError',
                type: 'final',
              },
            },
          },
          unAuthenticated: {
            meta: {
              message: 'user is currently NOT authenticated',
            },
          },
        },
      },

      notFound: {
        meta: {
          message: 'community not found.',
        },
        entry: 'notFound',
        type: 'final',
      },

      error: {
        entry: 'logError',
        type: 'final',
      },
    },
  };
}

export default createConfig;
