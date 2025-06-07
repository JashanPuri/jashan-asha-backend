import { Router, Request } from 'express';
import soapRoutes from '../soap/soap.routes';

const router = Router();

router.use('/soap', soapRoutes);

export default router;
