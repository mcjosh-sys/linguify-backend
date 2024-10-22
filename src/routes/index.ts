import { Router } from "express";
import courseRouter from "./courses.routes"
import unitRouter from "./units.routes"
import lessonRouter from "./lessons.routes"
import challengeRouter from "./challenges.routes"
import challengeOptionRouter from "./challenge-options.routes"
import userRouter from "./users.routes"
import subscriptionRouter from './subscription.routes'
import webhooksRouter from './webhooks.routes'
import mediaRouter from './media.routes'
import adminRouter from './admin.routes'
import invitationsRouter from './invitations.routes'

const router = Router()

router.use('/courses', courseRouter)
router.use('/units', unitRouter)
router.use('/lessons', lessonRouter)
router.use("/challenges", challengeRouter)
router.use("/challenge-options", challengeOptionRouter);
router.use("/users", userRouter)
router.use("/subscription", subscriptionRouter)
router.use("/webhooks", webhooksRouter)
router.use("/media", mediaRouter)
router.use("/admin", adminRouter)
router.use("/invitations", invitationsRouter)


export default router