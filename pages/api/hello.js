// import clientPromise from "../../lib/mongo";
// export default async function handler(req, res) {
//   const client = await clientPromise;
//   const db = client.db("hicham_db");
//   const allPosts = await db
//     .collection("allPosts")
//     .find({}, { projection: { _id: 0 } })
//     .toArray();
//   // db.collection("users").updateOne({_id : 123232039232} , { $push || $pull: {hobbies : "hello there " <= this is the elements that we are going to add to hoobbis array }})

//   // db.collection("allPosts").insertOne({
//   //   ip: "2323r23möl2m3rö2ml3r",
//   //   message: "goeirjgoeijrgergergergerg",
//   //   proImage: "georijgerger.com.jpg",
//   // });
//   res.json({ status: 200, data: allPosts });
// }