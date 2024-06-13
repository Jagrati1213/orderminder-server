import { menuCollection } from "../../models/menu.model";
import { userCollection } from "../../models/user.model";
import { CustomRequest } from "../../types";
import { ApiResponse } from "../../utils/apiResponse";
import { ApiErrors } from "../../utils/apiErrors";
import { asyncHandler } from "../../utils/asyncHandler";
import { Response } from "express";

// CREATE NEW ITEM
export const createMenuItemController = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    try {
      // GET BODY OF MENU ITEM
      const { name, price, desc, image } = req.body;

      // GET USER ID FROM REQ OBJECT
      const currentUser = await userCollection
        .findById(req.user?._id)
        .select("-password -refreshToken");

      // CHECK VALIDATION FOR FIELDS
      if (!name || !price || !desc || !image) {
        return res.json(
          new ApiErrors({
            statusCode: 401,
            statusText: "ALL FIELDS ARE REQUIRED!",
          })
        );
      }

      // ADD MENU ITEM TO DB
      const menuItem = await menuCollection.create({
        name: name,
        description: desc,
        image: image,
        price: Number(price),
        rating: 2.5,
        userId: currentUser?._id,
      });

      // CHECK MENU ITEM IS CREATED OR NOT
      const createdMenuItem = await menuCollection
        .findById(menuItem._id)
        .select("-createdAt -updatedAt -__v");

      if (!createdMenuItem) {
        return res.json(
          new ApiErrors({
            statusCode: 409,
            statusText: "MENU ITEM CREATED FAILED!",
          })
        );
      }

      // PUSH THE ITEMS TO USER DB
      await userCollection.findByIdAndUpdate(
        { _id: currentUser?._id },
        {
          $push: {
            menuItems: createdMenuItem?._id,
          },
        }
      );

      // SEND RESPONSE OF MENUITEM
      return res.json(
        new ApiResponse({
          statusCode: 201,
          statusText: "MENU ITEM CREATED SUCCESSFULLY!",
          data: createdMenuItem,
        })
      );
    } catch (err) {
      console.error("ERROR IN CREATE MENU ITEM FAILED :", err);
      return res.json(
        new ApiErrors({
          statusCode: 400,
          statusText: `ERROR IN CREATE MENU, ${err}`,
        })
      );
    }
  }
);