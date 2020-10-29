import { getClient } from '@urql/svelte';

import { Machine, assign, spawn, send } from 'xstate';

import createPartnerConfig from './partnerConfig';

function createServices() {
  // create api here..
  const client = getClient();

  return {
    guards: {
      communityFound: (_, event) => event.data !== null,
      communityNotFound: (_, event) => event.data === null,
      isAuthenticated: context => context.isAuthenticated,
      isUnAuthenticated: context => context.isAuthenticated,
    },

    services: {
      // queryCommunity: context => queryCommunityBySlug(context.slug),
      // queryMyFollowing: () => queryMeCommunityFollows(),
      // toggleFollow: context => toggleFollow(context.community.id),
    },

    actions: {
      logError: (context, event) => console.error({ context, event }),
      // notFound: () => navigateTo('/not-found'),
      // login: () => navigateTo('/login'),

      refreshFollowers: send('REFRESH', {
        to: context => context.followMachineServices,
      }),

      setIsAuthenticated: assign({
        isAuthenticated: (_, event) => event.status,
      }),

      queryCommunitySuccess: assign({
        community: (_, event) => event.data,
      }),

      queryMyFollowingSuccess: assign({
        isFollowing: (context, event) =>
          event.data.includes(context.community.id),
      }),

      toggleFollowSuccess: assign({
        isFollowing: (_, event) => event.data,
      }),

      // createFollowMachineServices: assign({
      //   followMachineServices: context =>
      //     spawn(createFollowMachine(context.community, client)),
      // }),

      // createActivityMachineServices: assign({
      //   activitiesMachineServices: context =>
      //     spawn(createActivitiesMachineServices(context.community, client)),
      // }),
    },
  };
}

function create() {
  const services = createServices();
  return Machine({ ...createPartnerConfig() }, { ...services });
}

export default create;
