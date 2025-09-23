class RoleService {
  async getRoleIdByName(name) {
    const r = await db_pg.oneOrNone(`SELECT role_id FROM roles WHERE nom=$1`, [
      name,
    ]);
    if (!r) throw new Error(`Unknown role: ${name}`);
    return r.role_id;
  }

  async listForUser(userId) {
    const rows = await db_pg.any(
      `SELECT r.nom
       FROM user_roles ur
       JOIN roles r ON r.role_id = ur.role_id
       WHERE ur.user_id = $1`,
      [userId]
    );
    return rows.map((r) => r.nom);
  }

  async setExclusive(userId, roleName) {
    const roleId = await this.getRoleIdByName(roleName);
    return db_pg.tx(async (t) => {
      await t.none(`DELETE FROM user_roles WHERE user_id=$1 AND role_id<>$2`, [
        userId,
        roleId,
      ]);
      await t.none(
        `INSERT INTO user_roles (user_id, role_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, role_id) DO NOTHING`,
        [userId, roleId]
      );
    });
  }
}

export default new RoleService();
