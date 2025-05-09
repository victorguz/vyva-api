'use strict';

const { INTEGER } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    queryInterface.sequelize.query(`
    ALTER TABLE public."Transactions" ADD COLUMN "idOrder" INTEGER;

    ALTER TABLE public."Transactions" ADD CONSTRAINT "Transactions_idOrder_fkey" FOREIGN KEY ("idOrder") REFERENCES public."PurchaseOrders" (id) MATCH SIMPLE ON UPDATE CASCADE ON DELETE SET NULL;`);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
