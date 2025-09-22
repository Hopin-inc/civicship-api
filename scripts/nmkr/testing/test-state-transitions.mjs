import { canTransitionTo, shouldUpdateMint } from './dist/application/domain/nmkr/stateTransition.js';

console.log('QUEUED -> SUBMITTED:', canTransitionTo('QUEUED', 'SUBMITTED'));
console.log('SUBMITTED -> MINTED:', canTransitionTo('SUBMITTED', 'MINTED'));
console.log('MINTED -> QUEUED:', canTransitionTo('MINTED', 'QUEUED'));

console.log('State transition tests completed');
