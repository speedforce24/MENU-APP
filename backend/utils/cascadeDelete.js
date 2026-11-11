const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Food = require("../models/Food");
const Rating = require("../models/Rating");
const Comment = require("../models/Comment");
const AdminInvite = require("../models/AdminInvite");

/**
 * Deletes a user and every record that only makes sense while they exist.
 *
 * Current schema quirk: Food stores `restaurantName` (string), not a ref.
 * So we fan out by the names of the restaurants being deleted, not by id.
 * Returns a counts object so callers can show the user what happened.
 */
const cascadeDeleteUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  const restaurants = await Restaurant.find({ createdBy: userId });
  const restaurantNames = restaurants.map((r) => r.restaurantName);
  const restaurantIds = restaurants.map((r) => r._id);

  // Foods tied to any of this user's restaurants (matched by name)
  const foods = restaurantNames.length
    ? await Food.find({ restaurantName: { $in: restaurantNames } })
    : [];
  const foodIds = foods.map((f) => f._id);

  const [ratings, comments, foodsDeleted, restaurantsDeleted, invitesDeleted] =
    await Promise.all([
      foodIds.length ? Rating.deleteMany({ foodId: { $in: foodIds } }) : { deletedCount: 0 },
      foodIds.length ? Comment.deleteMany({ foodId: { $in: foodIds } }) : { deletedCount: 0 },
      foodIds.length ? Food.deleteMany({ _id: { $in: foodIds } }) : { deletedCount: 0 },
      restaurantIds.length
        ? Restaurant.deleteMany({ _id: { $in: restaurantIds } })
        : { deletedCount: 0 },
      // Admin invites this user created (used ones stay for audit; drop unused)
      AdminInvite.deleteMany({ createdBy: userId, usedBy: null }),
    ]);

  await User.deleteOne({ _id: userId });

  return {
    user: 1,
    restaurants: restaurantsDeleted.deletedCount || 0,
    foods: foodsDeleted.deletedCount || 0,
    ratings: ratings.deletedCount || 0,
    comments: comments.deletedCount || 0,
    unusedInvites: invitesDeleted.deletedCount || 0,
  };
};

/**
 * Finds and removes restaurants whose owner no longer exists, plus any
 * foods/ratings/comments attached to those restaurants. Returns counts.
 */
const cleanupOrphans = async () => {
  const restaurants = await Restaurant.find().select("_id restaurantName createdBy");
  const ownerIds = [...new Set(restaurants.map((r) => String(r.createdBy)))];
  const existingOwners = await User.find({ _id: { $in: ownerIds } }).select("_id");
  const existingOwnerIds = new Set(existingOwners.map((u) => String(u._id)));

  const orphanRestaurants = restaurants.filter(
    (r) => !existingOwnerIds.has(String(r.createdBy))
  );
  if (orphanRestaurants.length === 0) {
    return { restaurants: 0, foods: 0, ratings: 0, comments: 0 };
  }

  const orphanNames = orphanRestaurants.map((r) => r.restaurantName);
  const orphanIds = orphanRestaurants.map((r) => r._id);

  const foods = await Food.find({ restaurantName: { $in: orphanNames } });
  const foodIds = foods.map((f) => f._id);

  const [ratings, comments, foodsDeleted, restaurantsDeleted] = await Promise.all([
    foodIds.length ? Rating.deleteMany({ foodId: { $in: foodIds } }) : { deletedCount: 0 },
    foodIds.length ? Comment.deleteMany({ foodId: { $in: foodIds } }) : { deletedCount: 0 },
    foodIds.length ? Food.deleteMany({ _id: { $in: foodIds } }) : { deletedCount: 0 },
    Restaurant.deleteMany({ _id: { $in: orphanIds } }),
  ]);

  return {
    restaurants: restaurantsDeleted.deletedCount || 0,
    foods: foodsDeleted.deletedCount || 0,
    ratings: ratings.deletedCount || 0,
    comments: comments.deletedCount || 0,
  };
};

module.exports = { cascadeDeleteUser, cleanupOrphans };
