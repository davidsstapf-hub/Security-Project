import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { allActivities } from '../../src/content/studyData.js';
import { getObjectiveVisual, objectiveVisuals } from '../../src/content/objectiveVisuals.js';

describe('objective reading visuals', () => {
  it('provides a reusable visual for every lesson activity with an exam objective', () => {
    const missing = allActivities
      .filter((activity) => activity.type === 'lesson')
      .filter((activity) => /^\d/.test(String(activity.objective)))
      .filter((activity) => !getObjectiveVisual(activity))
      .map((activity) => `${activity.id} (${activity.objective})`);

    assert.deepEqual(missing, []);
  });

  it('keeps visuals substantive enough to teach while reading', () => {
    for (const visual of objectiveVisuals) {
      assert.ok(visual.title.length > 12);
      assert.ok(visual.caption.length > 40);
      assert.equal(visual.items.length, 4);
      for (const item of visual.items) {
        assert.ok(item.label.length > 2);
        assert.ok(item.value.length > 8);
      }
    }
  });
});