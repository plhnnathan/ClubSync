import Club, { IClub } from "../models/Clube";
import User from "../models/User";

interface UpdateClubInput {
  name?: string;
  logoUrl?: string;
  primaryColor?: string;
}

export class ClubService {
  async getClub(clubId: string): Promise<IClub> {
    const club = await Club.findById(clubId);
    if (!club) throw new Error("Club not found");
    return club;
  }

  async updateClub(clubId: string, input: UpdateClubInput): Promise<IClub> {
    const club = await Club.findByIdAndUpdate(
      clubId,
      { $set: input },
      { new: true, runValidators: true },
    );
    if (!club) throw new Error("Club not found");
    return club;
  }

  async getClubMembers(clubId: string) {
    return User.find({ clubId }).select("-password");
  }
}

export default new ClubService();
